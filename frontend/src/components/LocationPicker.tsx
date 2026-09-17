import { useQuery } from "@tanstack/react-query";
import { LocateFixed } from "../assets/icons";
import type { LocationStatus } from "../hooks/useDeviceLocationProvince";
import { fetchDistricts, fetchProvinces } from "../api/geo";
import { useSettings } from "../context/SettingsContext";
import { useTranslation } from "../i18n/useTranslation";
import { localizedName } from "../lib/localizedName";

type Props = {
  provinceId: string | null;
  districtId: string | null;
  onChangeProvince: (id: string) => void;
  onChangeDistrict: (id: string | null) => void;
  locationStatus: LocationStatus;
  onUseMyLocation: () => void;
};

/** Full-width picker rendered inside a bottom sheet (see Sheet.tsx) — stacked, not squeezed
 * into the header, so it never overflows on narrow screens. */
export function LocationPicker({
  provinceId,
  districtId,
  onChangeProvince,
  onChangeDistrict,
  locationStatus,
  onUseMyLocation,
}: Props) {
  const { language } = useSettings();
  const { t } = useTranslation();
  const { data: provinces = [] } = useQuery({ queryKey: ["geo", "provinces"], queryFn: fetchProvinces });
  const { data: districts = [] } = useQuery({
    queryKey: ["geo", "districts", provinceId],
    queryFn: () => fetchDistricts(provinceId as string),
    enabled: !!provinceId,
  });

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onUseMyLocation}
        disabled={locationStatus === "locating"}
        className="flex items-center justify-center gap-2 rounded-xl bg-sky-400/80 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-sky-400 disabled:opacity-60"
      >
        <LocateFixed className={`h-4 w-4 ${locationStatus === "locating" ? "animate-pulse" : ""}`} />
        {locationStatus === "locating" ? t("locationPicker.locating") : t("locationPicker.useCurrentLocation")}
      </button>

      <div>
        <label className="mb-1 block text-xs opacity-60">{t("locationPicker.province")}</label>
        <select
          className="w-full rounded-xl bg-white/10 px-3 py-2.5 text-sm text-white outline-none"
          value={provinceId ?? ""}
          onChange={(e) => {
            onChangeProvince(e.target.value);
            onChangeDistrict(null);
          }}
        >
          <option value="" disabled>
            {t("locationPicker.selectProvince")}
          </option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id} className="text-black">
              {localizedName(p, language)}
            </option>
          ))}
        </select>
      </div>

      {provinceId && districts.length > 0 && (
        <div>
          <label className="mb-1 block text-xs opacity-60">{t("locationPicker.district")}</label>
          <select
            className="w-full rounded-xl bg-white/10 px-3 py-2.5 text-sm text-white outline-none"
            value={districtId ?? ""}
            onChange={(e) => onChangeDistrict(e.target.value || null)}
          >
            <option value="">{t("locationPicker.allDistricts")}</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id} className="text-black">
                {localizedName(d, language)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
