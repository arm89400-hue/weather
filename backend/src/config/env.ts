import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  TMD_API_UID: z.string().optional(),
  TMD_API_UKEY: z.string().optional(),
  TMD_API_BASE_URL: z.string().default("https://data.tmd.go.th/api"),
  VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_SUBJECT: z.string().default("mailto:admin@example.com"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

// Comma-separated so multiple frontends can share one backend: the web app's own origin
// (CORS_ORIGIN), plus the pseudo-origins native app shells load from — Capacitor serves local
// content under https://localhost on Android and capacitor://localhost on iOS, which is
// genuinely cross-origin from here even though the app calls an absolute backend URL (see
// frontend/capacitor.config.ts). Used by both the REST CORS middleware and the Socket.IO CORS
// config so they never drift apart.
export const allowedOrigins = [env.CORS_ORIGIN, "https://localhost", "capacitor://localhost"];
