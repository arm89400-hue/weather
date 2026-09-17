import { Sun as SunIcon, Sunrise } from "../assets/icons";
import { useTranslation } from "../i18n/useTranslation";

function formatTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

export function SunArc({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  const { t, dateLocale } = useTranslation();
  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();
  const now = Date.now();
  const progress = Math.min(1, Math.max(0, (now - sunriseMs) / (sunsetMs - sunriseMs)));
  const isDaytime = now >= sunriseMs && now <= sunsetMs;

  const cx = 100;
  const cy = 88;
  const r = 78;
  const angle = Math.PI * (1 - progress);
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy - r * Math.sin(angle);

  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="mb-1 flex items-center gap-2 text-sm opacity-80">
        <Sunrise className="h-4 w-4" />
        {t("sun.label")}
      </div>
      <svg viewBox="0 0 200 100" className="w-full">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={2}
          strokeDasharray="4 5"
        />
        <line x1={cx - r - 8} y1={cy} x2={cx + r + 8} y2={cy} stroke="rgba(255,255,255,0.25)" />
        {isDaytime && (
          <circle cx={sunX} cy={sunY} r={7} fill="#facc15" stroke="#fff" strokeWidth={1.5} />
        )}
      </svg>
      <div className="flex justify-between text-sm tabular-nums">
        <div className="text-left">
          <div className="font-semibold">{formatTime(sunrise, dateLocale)}</div>
          <div className="text-xs opacity-60">{t("sun.am")}</div>
        </div>
        <SunIcon className="h-5 w-5 self-center opacity-70" />
        <div className="text-right">
          <div className="font-semibold">{formatTime(sunset, dateLocale)}</div>
          <div className="text-xs opacity-60">{t("sun.pm")}</div>
        </div>
      </div>
    </div>
  );
}
