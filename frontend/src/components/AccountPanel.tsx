import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "../assets/icons";
import { fetchProvinces } from "../api/geo";
import { updateFavoriteProvince } from "../api/users";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { useTranslation } from "../i18n/useTranslation";
import { localizedName } from "../lib/localizedName";

export function AccountPanel({ onClose }: { onClose: () => void }) {
  const { user, logout, setUser } = useAuth();
  const { language } = useSettings();
  const { t } = useTranslation();
  const { status: pushStatus, subscribe, unsubscribe } = usePushNotifications();
  const [savingProvince, setSavingProvince] = useState(false);
  const { data: provinces = [] } = useQuery({
    queryKey: ["geo", "provinces"],
    queryFn: fetchProvinces,
    enabled: !!user,
  });

  if (user) {
    const notifyEnabled = pushStatus === "subscribed";

    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm opacity-70">{t("account.signedInAs", { email: user.email })}</p>

        <div>
          <label className="mb-1 block text-xs opacity-60">{t("account.alertMeIn")}</label>
          <select
            className="w-full rounded-xl bg-white/10 px-3 py-2.5 text-sm text-white outline-none disabled:opacity-50"
            value={user.favoriteProvinceId ?? ""}
            disabled={savingProvince}
            onChange={async (e) => {
              const favoriteProvinceId = e.target.value || null;
              setSavingProvince(true);
              try {
                const updated = await updateFavoriteProvince(favoriteProvinceId);
                setUser(updated);
              } finally {
                setSavingProvince(false);
              }
            }}
          >
            <option value="">{t("account.notSet")}</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id} className="text-black">
                {localizedName(p, language)}
              </option>
            ))}
          </select>
        </div>

        {pushStatus !== "unsupported" && (
          <button
            onClick={() => (notifyEnabled ? unsubscribe() : subscribe())}
            disabled={!user.favoriteProvinceId || pushStatus === "checking" || pushStatus === "denied"}
            className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-sm transition hover:bg-white/15 disabled:opacity-50"
          >
            <span>{t("account.notify")}</span>
            <span
              className={`h-5 w-9 rounded-full transition ${notifyEnabled ? "bg-sky-400" : "bg-white/20"}`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transition ${notifyEnabled ? "translate-x-4" : ""}`}
              />
            </span>
          </button>
        )}
        {pushStatus === "denied" && <p className="text-xs opacity-60">{t("account.notifyBlocked")}</p>}
        {pushStatus !== "denied" && !user.favoriteProvinceId && (
          <p className="text-xs opacity-60">{t("account.pickProvinceFirst")}</p>
        )}

        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-medium transition hover:bg-white/15"
        >
          <LogOut className="h-4 w-4" />
          {t("account.logOut")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm opacity-70">{t("account.signInPrompt")}</p>
      <Link
        to="/login"
        onClick={onClose}
        className="rounded-xl bg-sky-400/80 py-2.5 text-center text-sm font-medium text-slate-900 transition hover:bg-sky-400"
      >
        {t("account.signIn")}
      </Link>
      <Link
        to="/register"
        onClick={onClose}
        className="rounded-xl bg-white/10 py-2.5 text-center text-sm font-medium transition hover:bg-white/15"
      >
        {t("account.createAccount")}
      </Link>
    </div>
  );
}
