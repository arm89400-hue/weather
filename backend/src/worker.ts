import { Worker } from "bullmq";
import { createRedisConnection } from "./lib/redis.js";
import { logger } from "./lib/logger.js";
import { INGESTION_QUEUE, createIngestionQueue, scheduleRepeatableJobs } from "./ingestion/scheduler.js";
import { runPullStations } from "./ingestion/jobs/pullStations.js";
import { runPullCurrentWeather } from "./ingestion/jobs/pullCurrentWeather.js";
import { runPullForecast } from "./ingestion/jobs/pullForecast.js";
import { runPullOpenMeteoWeather } from "./ingestion/jobs/pullOpenMeteoWeather.js";

const queue = createIngestionQueue();

const worker = new Worker(
  INGESTION_QUEUE,
  async (job) => {
    switch (job.name) {
      case "pullStations":
        return runPullStations();
      case "pullCurrentWeather":
        return runPullCurrentWeather();
      case "pullForecast":
        return runPullForecast();
      case "pullOpenMeteoWeather":
        return runPullOpenMeteoWeather();
      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  },
  { connection: createRedisConnection(), concurrency: 1 }
);

worker.on("completed", (job) => logger.info({ job: job.name, id: job.id }, "job completed"));
worker.on("failed", (job, err) => logger.error({ job: job?.name, id: job?.id, err }, "job failed"));

await scheduleRepeatableJobs(queue);
logger.info("Ingestion worker started, repeatable jobs scheduled");
