import { prisma } from "../../lib/prisma.js";
import { getSunTimes } from "../../lib/sun.js";
import { beaufortScale, windDirectionLabel } from "../../lib/weatherMath.js";

type LocationQuery = { provinceId?: string; districtId?: string };

const BANGKOK_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Forecast rows are stored midnight-anchored in Bangkok time (see ingestion/openMeteoClient.ts
 * and tmdClient.ts), so filtering with `gte: new Date()` (the current instant) would exclude
 * today's row from mid-morning onward — "now" is always later than today's own midnight. Using
 * the start of the current Bangkok calendar day as the lower bound keeps today included all day.
 */
function startOfTodayBangkok(): Date {
  const bangkokNow = new Date(Date.now() + BANGKOK_UTC_OFFSET_MS);
  const y = bangkokNow.getUTCFullYear();
  const m = bangkokNow.getUTCMonth();
  const d = bangkokNow.getUTCDate();
  return new Date(Date.UTC(y, m, d) - BANGKOK_UTC_OFFSET_MS);
}

/**
 * TMD stations are matched down to province level only (see ingestion/geoMatch.ts), so a
 * district lookup first tries a station tied directly to that district (in case one is ever
 * curated manually) and otherwise falls back to any station in the district's province.
 */
async function resolveStation({ provinceId, districtId }: LocationQuery) {
  if (districtId) {
    const stationForDistrict = await prisma.station.findFirst({
      where: { districtId },
      orderBy: { id: "asc" },
    });
    if (stationForDistrict) return stationForDistrict;

    const district = await prisma.district.findUnique({ where: { id: districtId } });
    if (!district) return null;

    return prisma.station.findFirst({
      where: { provinceId: district.provinceId },
      orderBy: { id: "asc" },
    });
  }

  if (provinceId) {
    return prisma.station.findFirst({ where: { provinceId }, orderBy: { id: "asc" } });
  }

  return null;
}

export async function getCurrentWeather(query: LocationQuery) {
  const station = await resolveStation(query);
  if (!station) return null;

  const reading = await prisma.weatherReading.findFirst({
    where: { stationId: station.id },
    orderBy: { observedAt: "desc" },
  });

  const sun = getSunTimes(station.lat, station.lng);
  const wind = reading
    ? {
        directionLabel: windDirectionLabel(reading.windDirection ?? undefined),
        scale: beaufortScale(reading.windSpeed ?? undefined),
      }
    : null;

  return { station, reading, sun, wind };
}

export async function getForecast(query: LocationQuery) {
  const station = await resolveStation(query);
  if (!station) return null;

  const forecasts = await prisma.weatherForecast.findMany({
    where: { stationId: station.id, forecastDate: { gte: startOfTodayBangkok() } },
    orderBy: { forecastDate: "asc" },
    take: 7,
  });

  return { station, forecasts };
}

export async function getHistory({
  stationId,
  from,
  to,
}: {
  stationId: string;
  from?: Date;
  to?: Date;
}) {
  return prisma.weatherReading.findMany({
    where: {
      stationId,
      observedAt: {
        gte: from,
        lte: to,
      },
    },
    orderBy: { observedAt: "asc" },
  });
}
