import { prisma } from "../../lib/prisma.js";
import { logger } from "../../lib/logger.js";
import { publishWeatherUpdated } from "../../lib/redis.js";
import { fetchSevenDayForecast } from "../tmdClient.js";

export async function runPullForecast() {
  const days = await fetchSevenDayForecast();
  let written = 0;

  for (const day of days) {
    const station = await prisma.station.findUnique({
      where: { tmdStationId: day.tmdStationId },
    });
    if (!station) continue;

    await prisma.weatherForecast.upsert({
      where: {
        stationId_forecastDate: { stationId: station.id, forecastDate: day.forecastDate },
      },
      create: {
        stationId: station.id,
        forecastDate: day.forecastDate,
        minTemp: day.minTemp,
        maxTemp: day.maxTemp,
        condition: day.condition,
        rainChance: day.rainChance,
        raw: day.raw as any,
      },
      update: {
        minTemp: day.minTemp,
        maxTemp: day.maxTemp,
        condition: day.condition,
        rainChance: day.rainChance,
        raw: day.raw as any,
      },
    });

    written += 1;

    if (station.provinceId) {
      await publishWeatherUpdated({
        provinceId: station.provinceId,
        stationId: station.id,
        kind: "forecast",
      });
    }
  }

  logger.info({ written, total: days.length }, "pullForecast complete");
  return { written, total: days.length };
}
