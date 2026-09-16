import type { CurrentWeatherResponse, WeatherForecast } from "../api/weather";
import { conditionToIcon } from "./conditionIcon";

type Props = {
  data: CurrentWeatherResponse | undefined;
  todayForecast: WeatherForecast | undefined;
  isLoading: boolean;
};

export function WeatherHero({ data, todayForecast, isLoading }: Props) {
  const reading = data?.reading;
  const Icon = conditionToIcon(reading?.condition);

  if (isLoading) {
    return (
      <div className="px-5 pt-10 pb-6 text-center">
        <div className="mx-auto h-24 w-40 animate-pulse rounded-2xl bg-white/10" />
      </div>
    );
  }

  if (reading?.temperature == null) {
    return (
      <div className="px-5 pt-10 pb-6 text-center text-sm opacity-60">
        No current reading yet for this location.
      </div>
    );
  }

  const minMax =
    todayForecast?.minTemp != null && todayForecast?.maxTemp != null
      ? `${Math.round(todayForecast.minTemp)}°/${Math.round(todayForecast.maxTemp)}°`
      : null;

  const windParts = [
    data?.wind?.directionLabel ? `${data.wind.directionLabel} wind` : null,
    data?.wind?.scale != null ? `scale ${data.wind.scale}` : null,
  ].filter(Boolean);

  return (
    <div className="px-5 pt-8 pb-6 text-center">
      <div className="flex items-center justify-center gap-3">
        <Icon className="h-12 w-12 opacity-90" />
        <span className="text-8xl font-light tabular-nums">{Math.round(reading.temperature)}°</span>
      </div>

      <div className="mt-3 text-base font-medium">
        {reading.condition ?? "—"}
        {minMax && <span className="ml-1.5 opacity-80">{minMax}</span>}
      </div>

      {(reading.feelsLike != null || windParts.length > 0) && (
        <div className="mt-1 text-sm opacity-60">
          {reading.feelsLike != null && `Feels like ${Math.round(reading.feelsLike)}°`}
          {reading.feelsLike != null && windParts.length > 0 && "  "}
          {windParts.join(", ")}
        </div>
      )}
    </div>
  );
}
