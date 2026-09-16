import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { findNearestProvince, resolveDistrictForPoint } from "./geo.service.js";

export const geoRouter = Router();

const nearestQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

geoRouter.get("/nearest", async (req, res, next) => {
  try {
    const { lat, lng } = nearestQuerySchema.parse(req.query);
    const province = await findNearestProvince(lat, lng);
    if (!province) return res.status(404).json({ error: "No provinces seeded" });

    const district = await resolveDistrictForPoint(lat, lng, province.id);

    res.json({ province, district });
  } catch (err) {
    next(err);
  }
});

geoRouter.get("/provinces", async (_req, res, next) => {
  try {
    const provinces = await prisma.province.findMany({
      orderBy: { nameEn: "asc" },
      select: { id: true, nameTh: true, nameEn: true, region: true, lat: true, lng: true },
    });
    res.json(provinces);
  } catch (err) {
    next(err);
  }
});

geoRouter.get("/provinces/:provinceId/districts", async (req, res, next) => {
  try {
    const districts = await prisma.district.findMany({
      where: { provinceId: req.params.provinceId },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameTh: true, nameEn: true, lat: true, lng: true },
    });
    res.json(districts);
  } catch (err) {
    next(err);
  }
});
