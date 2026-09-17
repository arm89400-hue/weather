import { useQuery } from "@tanstack/react-query";
import { CircleUser, Droplets, List, MapPin, Settings as SettingsIcon, Wind as WindIcon } from "../assets/icons";
import { useEffect, useState } from "react";
import { fetchDistricts, fetchProvinces } from "../api/geo";
import { fetchCurrentWeather, fetchForecast } from "../api/weather";
import { AccountPanel } from "../components/AccountPanel";
import { ForecastList } from "../components/ForecastList";
import { LocationPicker } from "../components/LocationPicker";
import { LocationPrompt } from "../components/LocationPrompt";
import { Sheet } from "../components/Sheet";
import { SettingsPanel } from "../components/SettingsPanel";
import { StatTile } from "../components/StatTile";
import { SunArc } from "../components/SunArc";
import { WeatherHero } from "../components/WeatherHero";
import { useDeviceLocationProvince } from "../hooks/useDeviceLocationProvince";
import { useWeatherSocket } from "../hooks/useWeatherSocket";
import { useSettings } from "../context/SettingsContext";
import { useTranslation } from "../i18n/useTranslation";
import { localizedName } from "../lib/localizedName";

const LAST_PROVINCE_KEY = "weather:lastProvinceId";
const LAST_DISTRICT_KEY = "weather:lastDistrictId";

export function DashboardPage() {
  const [provinceId, setProvinceId] = useState<string | null>(
    () => localStorage.getItem(LAST_PROVINCE_KEY)
  );
  const [districtId, setDistrictId] = useState<string | null>(
    () => localStorage.getItem(LAST_DISTRICT_KEY)
  );
  const [usedDeviceLocation, setUsedDeviceLocation] = useState(false);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const { language } = useSettings();
  const { t, translateRegion } = useTranslation();
  // Skip the ask if we already know where they were last time.
  const [locationPromptAnswered, setLocationPromptAnswered] = useState(
    () => !!localStorage.getItem(LAST_PROVINCE_KEY)
  );

  const { status: locationStatus, request: requestLocation } = useDeviceLocationProvince((location) => {
    setProvinceId(location.provinceId);
    setDistrictId(location.districtId);
    setUsedDeviceLocation(true);
  });

  // Once geolocation settles either way, the prompt has done its job.
  useEffect(() => {
    if (locationStatus !== "idle" && locationStatus !== "locating") {
      setLocationPromptAnswered(true);
    }
  }, [locationStatus]);

  const { data: provinces = [] } = useQuery({ queryKey: ["geo", "provinces"], queryFn: fetchProvinces });
  const { data: districts = [] } = useQuery({
    queryKey: ["geo", "districts", provinceId],
    queryFn: () => fetchDistricts(provinceId as string),
    enabled: !!provinceId,
  });

  // Fall back to the first province once the list loads, but only after the location prompt
  // has been answered (allowed, denied, or explicitly skipped) and nothing got selected.
  useEffect(() => {
    if (!provinceId && locationPromptAnswered && locationStatus !== "locating" && provinces.length > 0) {
      setProvinceId(provinces[0].id);
    }
  }, [provinceId, locationPromptAnswered, locationStatus, provinces]);

  useEffect(() => {
    if (provinceId) localStorage.setItem(LAST_PROVINCE_KEY, provinceId);
  }, [provinceId]);

  useEffect(() => {
    if (districtId) localStorage.setItem(LAST_DISTRICT_KEY, districtId);
    else localStorage.removeItem(LAST_DISTRICT_KEY);
  }, [districtId]);

  useWeatherSocket(provinceId);

  const locationParams = { provinceId: provinceId ?? undefined, districtId: districtId ?? undefined };

  const currentQuery = useQuery({
    queryKey: ["weather", "current", provinceId, districtId],
    queryFn: () => fetchCurrentWeather(locationParams),
    enabled: !!provinceId,
  });

  const forecastQuery = useQuery({
    queryKey: ["weather", "forecast", provinceId, districtId],
    queryFn: () => fetchForecast(locationParams),
    enabled: !!provinceId,
  });

  const province = provinces.find((p) => p.id === provinceId);
  const district = districts.find((d) => d.id === districtId);
  const locationName = localizedName(district, language) || localizedName(province, language) || t("common.dash");
  const reading = currentQuery.data?.reading ?? null;
  const todayForecast = forecastQuery.data?.forecasts?.[0];
  const showLocationPrompt = !provinceId && !locationPromptAnswered;

  return (
    <div className="mx-auto min-h-screen max-w-md pb-10">
      <div className="flex items-start justify-between px-5 pt-4">
        <div>
          <h1 className="text-lg font-semibold leading-tight">{locationName}</h1>
          {province?.region && (
            <p className="text-xs opacity-60">{t("region.suffix", { region: translateRegion(province.region) ?? "" })}</p>
          )}
          <button
            onClick={() => setLocationSheetOpen(true)}
            className="mt-1 opacity-60 transition hover:opacity-100"
            aria-label={t("header.changeLocation")}
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>

        <div className="glass-card flex items-center gap-1 rounded-full p-1">
          <button
            onClick={() => setLocationSheetOpen(true)}
            className="rounded-full p-2.5 opacity-80 transition hover:bg-white/10 hover:opacity-100"
            aria-label={t("header.chooseLocation")}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setAccountSheetOpen(true)}
            className="rounded-full p-2.5 opacity-80 transition hover:bg-white/10 hover:opacity-100"
            aria-label={t("header.account")}
          >
            <CircleUser className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSettingsSheetOpen(true)}
            className="rounded-full p-2.5 opacity-80 transition hover:bg-white/10 hover:opacity-100"
            aria-label={t("header.settings")}
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showLocationPrompt ? (
        <LocationPrompt
          status={locationStatus}
          onAllow={requestLocation}
          onDismiss={() => setLocationPromptAnswered(true)}
        />
      ) : (
        <>
          {locationStatus === "denied" && (
            <p className="px-5 pt-2 text-center text-xs opacity-60">
              {t("location.deniedNotice", { name: localizedName(province, language) || locationName })}
            </p>
          )}
          {usedDeviceLocation && locationStatus === "resolved" && (
            <p className="px-5 pt-2 text-center text-xs opacity-60">{t("location.deviceNotice")}</p>
          )}

          <WeatherHero data={currentQuery.data} todayForecast={todayForecast} isLoading={currentQuery.isLoading} />

          <div className="flex flex-col gap-4 px-5">
            <ForecastList forecasts={forecastQuery.data?.forecasts ?? []} />

            <div className="grid grid-cols-2 gap-4">
              <StatTile
                icon={Droplets}
                label={t("stat.precipitation")}
                value={reading?.rainfallMm != null ? reading.rainfallMm.toFixed(1) : t("common.dash")}
                unit="mm"
                subtitle={t("stat.precipitationSubtitle")}
              />
              <StatTile
                icon={WindIcon}
                label={t("stat.wind")}
                value={reading?.windSpeed != null ? Math.round(reading.windSpeed) : t("common.dash")}
                unit="km/h"
                subtitle={
                  currentQuery.data?.wind?.directionLabel
                    ? t("stat.windSubtitle", {
                        dir: currentQuery.data.wind.directionLabel,
                        scale: currentQuery.data.wind.scale ?? t("common.dash"),
                      })
                    : undefined
                }
              />
              <div className="col-span-2">
                <StatTile
                  icon={Droplets}
                  label={t("stat.humidity")}
                  value={reading?.humidity != null ? Math.round(reading.humidity) : t("common.dash")}
                  unit="%"
                />
              </div>
            </div>

            {currentQuery.data?.sun && (
              <SunArc sunrise={currentQuery.data.sun.sunrise} sunset={currentQuery.data.sun.sunset} />
            )}
          </div>
        </>
      )}

      <Sheet open={locationSheetOpen} onClose={() => setLocationSheetOpen(false)} title={t("sheet.location")}>
        <LocationPicker
          provinceId={provinceId}
          districtId={districtId}
          onChangeProvince={(id) => {
            setProvinceId(id);
            setUsedDeviceLocation(false);
          }}
          onChangeDistrict={setDistrictId}
          locationStatus={locationStatus}
          onUseMyLocation={() => {
            setUsedDeviceLocation(false);
            requestLocation();
            setLocationSheetOpen(false);
          }}
        />
      </Sheet>

      <Sheet open={accountSheetOpen} onClose={() => setAccountSheetOpen(false)} title={t("sheet.account")}>
        <AccountPanel onClose={() => setAccountSheetOpen(false)} />
      </Sheet>

      <Sheet open={settingsSheetOpen} onClose={() => setSettingsSheetOpen(false)} title={t("sheet.settings")}>
        <SettingsPanel />
      </Sheet>
    </div>
  );
}
