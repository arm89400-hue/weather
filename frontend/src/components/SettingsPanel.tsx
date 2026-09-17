import { ChevronRight } from "../assets/icons";
import { useSettings } from "../context/SettingsContext";
import { useTranslation } from "../i18n/useTranslation";

const REPORT_ISSUE_URL = "https://github.com/arm89400-hue/weather/issues/new";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`h-5 w-9 rounded-full transition ${on ? "bg-sky-400" : "bg-white/20"}`}>
      <span className={`block h-5 w-5 rounded-full bg-white transition ${on ? "translate-x-4" : ""}`} />
    </button>
  );
}

function Row({
  label,
  value,
  onClick,
  href,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <>
      <span className="text-sm font-medium">{label}</span>
      <span className="flex items-center gap-1.5 text-sm opacity-60">
        {value}
        <ChevronRight className="h-4 w-4" />
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3.5 transition hover:bg-white/15"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3.5 text-left transition hover:bg-white/15"
    >
      {content}
    </button>
  );
}

function ToggleRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3.5">
      <span className="text-sm font-medium">{label}</span>
      <Toggle on={on} onClick={onToggle} />
    </div>
  );
}

export function SettingsPanel() {
  const { unit, setUnit, language, setLanguage, updateOnMobileData, setUpdateOnMobileData } = useSettings();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5">
      <Row
        label={t("settings.temperatureUnit")}
        value={unit === "C" ? `${t("settings.celsius")} °C` : `${t("settings.fahrenheit")} °F`}
        onClick={() => setUnit(unit === "C" ? "F" : "C")}
      />
      <Row
        label={t("settings.language")}
        value={language === "en" ? `${t("settings.languageEnglish")} (EN)` : `${t("settings.languageThai")} (TH)`}
        onClick={() => setLanguage(language === "en" ? "th" : "en")}
      />
      <ToggleRow
        label={t("settings.updateMobileData")}
        on={updateOnMobileData}
        onToggle={() => setUpdateOnMobileData(!updateOnMobileData)}
      />
      <div className="mt-1">
        <Row label={t("settings.reportIssue")} href={REPORT_ISSUE_URL} />
      </div>
    </div>
  );
}
