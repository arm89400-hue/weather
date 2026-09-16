import Redis from "ioredis";
import { env } from "../config/env.js";

export function createRedisConnection() {
  return new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
}

export const redis = createRedisConnection();

export const WEATHER_UPDATED_CHANNEL = "weather:updated";

export type WeatherUpdatedEvent = {
  provinceId: string;
  stationId: string;
  kind: "reading" | "forecast";
};

export async function publishWeatherUpdated(event: WeatherUpdatedEvent) {
  await redis.publish(WEATHER_UPDATED_CHANNEL, JSON.stringify(event));
}
