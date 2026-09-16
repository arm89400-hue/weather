import type { Station } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { sendPushToUser, type PushPayload } from "../modules/push/push.service.js";

type AlertableReading = {
  condition?: string | null;
  temperature?: number | null;
  rainfallMm?: number | null;
};

/** Kept as one isolated function so the thresholds are easy to retune later. */
export function isAlertWorthy(reading: AlertableReading): boolean {
  if (reading.condition === "Thunderstorm") return true;
  if (reading.rainfallMm != null && reading.rainfallMm >= 10) return true;
  if (reading.temperature != null && (reading.temperature >= 40 || reading.temperature <= 10)) return true;
  return false;
}

function describeReading(reading: AlertableReading): string {
  const parts: string[] = [];
  if (reading.condition) parts.push(reading.condition);
  if (reading.temperature != null) parts.push(`${Math.round(reading.temperature)}°C`);
  if (reading.rainfallMm != null && reading.rainfallMm > 0) parts.push(`${reading.rainfallMm}mm rain`);
  return parts.join(", ") || "Notable weather";
}

/**
 * Called after every reading upsert during ingestion (see jobs/pullOpenMeteoWeather.ts). Only
 * sends a push on a genuine transition into an alert state — `station.lastAlertCondition` is
 * how we avoid re-sending every ~20-minute ingestion cycle for the same ongoing storm, and gets
 * cleared once conditions calm down so a later recurrence alerts again.
 */
export async function checkAndSendAlert(station: Station, reading: AlertableReading) {
  if (!isAlertWorthy(reading)) {
    if (station.lastAlertCondition !== null) {
      await prisma.station.update({
        where: { id: station.id },
        data: { lastAlertCondition: null },
      });
    }
    return;
  }

  const condition = reading.condition ?? "Severe weather";
  if (condition === station.lastAlertCondition) return; // already alerted for this ongoing condition

  await prisma.station.update({
    where: { id: station.id },
    data: { lastAlertCondition: condition, lastAlertAt: new Date() },
  });

  if (!station.provinceId) return;

  const users = await prisma.user.findMany({
    where: { favoriteProvinceId: station.provinceId, pushSubscriptions: { some: {} } },
    select: { id: true },
  });
  if (users.length === 0) return;

  const payload: PushPayload = {
    title: `${condition} warning`,
    body: `${station.nameEn}: ${describeReading(reading)}`,
    url: "/",
  };

  logger.info({ stationId: station.id, condition, userCount: users.length }, "Sending weather alert push");
  await Promise.all(users.map((u) => sendPushToUser(u.id, payload)));
}
