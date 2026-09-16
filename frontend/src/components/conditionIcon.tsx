import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Sun } from "../assets/icons";
import type { ComponentType } from "react";

type IconProps = { className?: string };

/** Best-effort mapping from TMD's free-text condition string to an icon; exact TMD wording is
 * unverified (see ingestion/tmdClient.ts), so this matches broadly by keyword. */
export function conditionToIcon(condition?: string | null): ComponentType<IconProps> {
  const c = (condition ?? "").toLowerCase();
  if (c.includes("storm") || c.includes("thunder")) return CloudLightning;
  if (c.includes("drizzl")) return CloudDrizzle;
  if (c.includes("rain") || c.includes("shower")) return CloudRain;
  if (c.includes("fog") || c.includes("mist") || c.includes("haze")) return CloudFog;
  if (c.includes("clear") || c.includes("sunny")) return Sun;
  if (c.includes("partly") || c.includes("few cloud")) return CloudSun;
  if (c.includes("cloud") || c.includes("overcast")) return Cloud;
  return CloudSun;
}
