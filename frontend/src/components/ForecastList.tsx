import { CalendarDays } from "../assets/icons";
import type { WeatherForecast } from "../api/weather";
import { useSettings } from "../context/SettingsContext";
import { useTranslation } from "../i18n/useTranslation";
import { formatTemp } from "../lib/temperature";
import { conditionToIcon } from "./conditionIcon";

// Compares by Bangkok calendar date, not array position — the backend already scopes the
// query to "today onward" in Bangkok time, but trusting index 0 here would silently mislabel
// a day if that ever drifts (as it did before the backend timezone fix).
function isSameBangkokDay(a: Date, b: Date) {
  const fmt = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
  return fmt(a) === fmt(b);
}

function formatDay(dateStr: string, locale: string, todayLabel: string) {
  const date = new Date(dateStr);
  if (isSameBangkokDay(date, new Date())) return todayLabel;
  return date.toLocaleDateString(locale, { timeZone: "Asia/Bangkok", month: "short", day: "numeric" });
}

export function ForecastList({ forecasts }: { forecasts: WeatherForecast[] }) {
  const { unit } = useSettings();
  const { t, translateCondition, dateLocale } = useTranslation();

  if (forecasts.length === 0) {
    return <div className="glass-card rounded-3xl p-5 text-sm opacity-60">{t("forecast.empty")}</div>;
  }

  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium opacity-80">
        <CalendarDays className="h-4 w-4" />
        {t("forecast.nextDays", { n: forecasts.length })}
      </div>
      <div className="divide-y divide-white/10">
        {forecasts.map((f) => {
          const Icon = conditionToIcon(f.condition);
          return (
            <div key={f.id} className="flex items-center justify-between py-3 text-sm">
              <span className="w-20 font-medium">{formatDay(f.forecastDate, dateLocale, t("forecast.today"))}</span>
              <div className="flex flex-1 flex-col items-center">
                <Icon className="h-6 w-6 opacity-90" />
                {f.rainChance != null && (
                  <span className="mt-0.5 text-xs text-sky-300">{Math.round(f.rainChance)}%</span>
                )}
              </div>
              <span className="w-28 text-center opacity-80">{translateCondition(f.condition)}</span>
              <span className="w-20 text-right tabular-nums">
                {formatTemp(f.minTemp, unit)} / {formatTemp(f.maxTemp, unit)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
