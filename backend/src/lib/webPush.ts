import webPush from "web-push";
import { env } from "../config/env.js";

webPush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

export { webPush };
