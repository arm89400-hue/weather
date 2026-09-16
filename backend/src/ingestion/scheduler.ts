import { Queue } from "bullmq";
import { createRedisConnection } from "../lib/redis.js";

export const INGESTION_QUEUE = "ingestion";

export type IngestionJobName =
  | "pullStations"
  | "pullCurrentWeather"
  | "pullForecast"
  | "pullOpenMeteoWeather";

export function createIngestionQueue() {
  return new Queue(INGESTION_QUEUE, { connection: createRedisConnection() });
}

/** Registers the repeatable jobs that drive the ingestion pipeline. Call once on worker boot. */
export async function scheduleRepeatableJobs(queue: Queue) {
  await queue.add(
    "pullStations" satisfies IngestionJobName,
    {},
    { repeat: { pattern: "0 3 * * *" }, jobId: "pullStations" } // once daily, station directory rarely changes
  );

  await queue.add(
    "pullCurrentWeather" satisfies IngestionJobName,
    {},
    { repeat: { every: 30 * 60 * 1000 }, jobId: "pullCurrentWeather" } // every 30 min
  );

  await queue.add(
    "pullForecast" satisfies IngestionJobName,
    {},
    { repeat: { every: 3 * 60 * 60 * 1000 }, jobId: "pullForecast" } // every 3 hours
  );

  // Open-Meteo needs no API key, so this is the live data source today — see
  // ingestion/openMeteoClient.ts. The TMD jobs above stay scheduled (harmlessly failing
  // until TMD_API_UID/UKEY are set) so nothing needs to change here once a key exists.
  await queue.add(
    "pullOpenMeteoWeather" satisfies IngestionJobName,
    {},
    { repeat: { every: 20 * 60 * 1000 }, jobId: "pullOpenMeteoWeather" } // every 20 min
  );
}
