import { MapPin } from "../assets/icons";
import type { LocationStatus } from "../hooks/useDeviceLocationProvince";

type Props = {
  status: LocationStatus;
  onAllow: () => void;
  onDismiss: () => void;
};

export function LocationPrompt({ status, onAllow, onDismiss }: Props) {
  return (
    <div className="px-5 pt-4">
      <div className="glass-card flex flex-col items-center gap-3 rounded-3xl p-6 text-center">
        <MapPin className="h-8 w-8 opacity-80" />
        <div>
          <p className="font-medium">Use your current location?</p>
          <p className="mt-1 text-sm opacity-70">
            We'll show weather for where you are right now instead of a default province.
          </p>
        </div>
        <div className="mt-1 flex w-full gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 rounded-xl bg-white/10 py-2 text-sm font-medium transition hover:bg-white/15"
          >
            Choose manually
          </button>
          <button
            onClick={onAllow}
            disabled={status === "locating"}
            className="flex-1 rounded-xl bg-sky-400/80 py-2 text-sm font-medium text-slate-900 transition hover:bg-sky-400 disabled:opacity-60"
          >
            {status === "locating" ? "Locating..." : "Use my location"}
          </button>
        </div>
      </div>
    </div>
  );
}
