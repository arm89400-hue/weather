import { CalendarDays } from "../assets/icons";
import type { WeatherForecast } from "../api/weather";
import { conditionToIcon } from "./conditionIcon";

// Compares by Bangkok calendar date, not array position — the backend already scopes the
// query to "today onward" in Bangkok time, but trusting index 0 here would silently mislabel
// a day if that ever drifts (as it did before the backend timezone fix).
function isSameBangkokDay(a: Date, b: Date) {
  const fmt = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
  return fmt(a) === fmt(b);
}

function formatDay(dateStr: string) {
  const date = new Date(dateStr);
  if (isSameBangkokDay(date, new Date())) return "Today";
  return date.toLocaleDateString("en-US", { timeZone: "Asia/Bangkok", month: "short", day: "numeric" });
}

export function ForecastList({ forecasts }: { forecasts: WeatherForecast[] }) {
  if (forecasts.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-5 text-sm opacity-60">
        No forecast data yet for this location.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium opacity-80">
        <CalendarDays className="h-4 w-4" />
        Next {forecasts.length} Days
      </div>
      <div className="divide-y divide-white/10">
        {forecasts.map((f) => {
          const Icon = conditionToIcon(f.condition);
          return (
            <div key={f.id} className="flex items-center justify-between py-3 text-sm">
              <span className="w-20 font-medium">{formatDay(f.forecastDate)}</span>
              <div className="flex flex-1 flex-col items-center">
                <Icon className="h-6 w-6 opacity-90" />
                {f.rainChance != null && (
                  <span className="mt-0.5 text-xs text-sky-300">{Math.round(f.rainChance)}%</span>
                )}
              </div>
              <span className="w-28 text-center opacity-80">{f.condition ?? "—"}</span>
              <span className="w-20 text-right tabular-nums">
                {f.minTemp != null ? Math.round(f.minTemp) : "—"}° /{" "}
                {f.maxTemp != null ? Math.round(f.maxTemp) : "—"}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
