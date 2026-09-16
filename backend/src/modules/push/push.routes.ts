import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { authGuard } from "../../middleware/authGuard.js";
import { removeSubscription, saveSubscription } from "./push.service.js";

export const pushRouter = Router();

// Public: the frontend needs this to know which key to subscribe browsers with.
pushRouter.get("/vapid-public-key", (_req, res) => {
  res.json({ publicKey: env.VAPID_PUBLIC_KEY });
});

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

pushRouter.post("/subscribe", authGuard, async (req, res, next) => {
  try {
    const sub = subscriptionSchema.parse(req.body);
    await saveSubscription(req.user!.id, sub);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

const unsubscribeSchema = z.object({ endpoint: z.string().url() });

pushRouter.delete("/subscribe", authGuard, async (req, res, next) => {
  try {
    const { endpoint } = unsubscribeSchema.parse(req.body);
    await removeSubscription(req.user!.id, endpoint);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
