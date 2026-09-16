import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authGuard } from "../../middleware/authGuard.js";

export const usersRouter = Router();

usersRouter.get("/me", authGuard, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, favoriteProvinceId: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

const updateMeSchema = z.object({
  favoriteProvinceId: z.string().nullable(),
});

usersRouter.patch("/me", authGuard, async (req, res, next) => {
  try {
    const { favoriteProvinceId } = updateMeSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { favoriteProvinceId },
      select: { id: true, email: true, name: true, role: true, favoriteProvinceId: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
