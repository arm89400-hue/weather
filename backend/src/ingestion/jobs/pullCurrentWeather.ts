import { prisma } from "../../lib/prisma.js";
import { logger } from "../../lib/logger.js";
import { publishWeatherUpdated } from "../../lib/redis.js";
import { computeFeelsLike } from "../../lib/weatherMath.js";
import { fetchCurrentWeather } from "../tmdClient.js";

export async function runPullCurrentWeather() {
  const readings = await fetchCurrentWeather();
  let written = 0;

  for (const reading of readings) {
    const station = await prisma.station.findUnique({
      where: { tmdStationId: reading.tmdStationId },
    });
    if (!station) {
      logger.debug({ tmdStationId: reading.tmdStationId }, "Skipping reading for unknown station");
      continue;
    }

    const feelsLike = computeFeelsLike(reading.temperature, reading.humidity, reading.windSpeed);

    await prisma.weatherReading.upsert({
      where: {
        stationId_observedAt: { stationId: station.id, observedAt: reading.observedAt },
      },
      create: {
        stationId: station.id,
        observedAt: reading.observedAt,
        temperature: reading.temperature,
        feelsLike,
        humidity: reading.humidity,
        rainfallMm: reading.rainfallMm,
        windSpeed: reading.windSpeed,
        windDirection: reading.windDirection,
        pressure: reading.pressure,
        condition: reading.condition,
        raw: reading.raw as any,
      },
      update: {
        temperature: reading.temperature,
        feelsLike,
        humidity: reading.humidity,
        rainfallMm: reading.rainfallMm,
        windSpeed: reading.windSpeed,
        windDirection: reading.windDirection,
        pressure: reading.pressure,
        condition: reading.condition,
        raw: reading.raw as any,
      },
    });

    written += 1;

    if (station.provinceId) {
      await publishWeatherUpdated({
        provinceId: station.provinceId,
        stationId: station.id,
        kind: "reading",
      });
    }
  }

  logger.info({ written, total: readings.length }, "pullCurrentWeather complete");
  return { written, total: readings.length };
}
