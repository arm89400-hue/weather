/** Derived weather values that don't need an external API — computed from raw readings. */

/** Simplified heat-index style "feels like" temperature in Celsius. */
export function computeFeelsLike(tempC?: number, humidityPct?: number, windKph?: number) {
  if (tempC === undefined) return undefined;

  if (tempC >= 27 && humidityPct !== undefined) {
    const t = tempC;
    const rh = humidityPct;
    // Rothfusz heat index regression (approximation, Celsius input converted internally).
    const tf = t * 9 / 5 + 32;
    const hiF =
      -42.379 +
      2.04901523 * tf +
      10.14333127 * rh -
      0.22475541 * tf * rh -
      0.00683783 * tf * tf -
      0.05481717 * rh * rh +
      0.00122874 * tf * tf * rh +
      0.00085282 * tf * rh * rh -
      0.00000199 * tf * tf * rh * rh;
    return Math.round(((hiF - 32) * 5) / 9);
  }

  if (tempC <= 10 && windKph !== undefined && windKph > 4.8) {
    const windChill =
      13.12 + 0.6215 * tempC - 11.37 * Math.pow(windKph, 0.16) + 0.3965 * tempC * Math.pow(windKph, 0.16);
    return Math.round(windChill);
  }

  return Math.round(tempC);
}

const COMPASS_LABELS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export function windDirectionLabel(degrees?: number) {
  if (degrees === undefined) return undefined;
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return COMPASS_LABELS[index];
}

/** Beaufort wind scale (0-12) from wind speed in km/h. */
export function beaufortScale(windKph?: number) {
  if (windKph === undefined) return undefined;
  const thresholds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 87, 102, 117];
  let scale = 12;
  for (let i = 0; i < thresholds.length; i++) {
    if (windKph < thresholds[i]) {
      scale = i;
      break;
    }
  }
  return scale;
}
