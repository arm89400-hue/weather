import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

export const stationsRouter = Router();

stationsRouter.get("/", async (req, res, next) => {
  try {
    const { provinceId } = req.query;
    const stations = await prisma.station.findMany({
      where: provinceId ? { provinceId: String(provinceId) } : undefined,
      orderBy: { nameEn: "asc" },
    });
    res.json(stations);
  } catch (err) {
    next(err);
  }
});
