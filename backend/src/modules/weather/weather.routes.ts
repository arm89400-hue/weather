import { Router } from "express";
import { z } from "zod";
import { getCurrentWeather, getForecast, getHistory } from "./weather.service.js";

export const weatherRouter = Router();

const locationQuerySchema = z
  .object({
    provinceId: z.string().optional(),
    districtId: z.string().optional(),
  })
  .refine((v) => v.provinceId || v.districtId, {
    message: "provinceId or districtId is required",
  });

weatherRouter.get("/current", async (req, res, next) => {
  try {
    const query = locationQuerySchema.parse(req.query);
    const result = await getCurrentWeather(query);
    if (!result) return res.status(404).json({ error: "No station found for location" });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

weatherRouter.get("/forecast", async (req, res, next) => {
  try {
    const query = locationQuerySchema.parse(req.query);
    const result = await getForecast(query);
    if (!result) return res.status(404).json({ error: "No station found for location" });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const historyQuerySchema = z.object({
  stationId: z.string(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

weatherRouter.get("/history", async (req, res, next) => {
  try {
    const { stationId, from, to } = historyQuerySchema.parse(req.query);
    const readings = await getHistory({ stationId, from, to });
    res.json(readings);
  } catch (err) {
    next(err);
  }
});
