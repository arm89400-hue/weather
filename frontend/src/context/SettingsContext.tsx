import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type TemperatureUnit = "C" | "F";
export type Language = "en" | "th";

type SettingsContextValue = {
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  updateOnMobileData: boolean;
  setUpdateOnMobileData: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const KEYS = {
  unit: "weather:unit",
  language: "weather:language",
  updateOnMobileData: "weather:updateOnMobileData",
} as const;

function readBoolean(key: string, fallback: boolean) {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === "true";
}

function detectDefaultLanguage(): Language {
  return navigator.language?.toLowerCase().startsWith("th") ? "th" : "en";
}

// All three settings work without an account — they're stored on-device only, never sent to the
// backend, so they apply instantly with no login (per product decision: only the severe-weather
// alert subscription in AccountPanel requires being signed in).
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<TemperatureUnit>(
    () => (localStorage.getItem(KEYS.unit) as TemperatureUnit) ?? "C"
  );
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem(KEYS.language) as Language) ?? detectDefaultLanguage()
  );
  const [updateOnMobileData, setUpdateOnMobileDataState] = useState(() =>
    readBoolean(KEYS.updateOnMobileData, true)
  );

  useEffect(() => {
    localStorage.setItem(KEYS.unit, unit);
  }, [unit]);
  useEffect(() => {
    localStorage.setItem(KEYS.language, language);
  }, [language]);
  useEffect(() => {
    localStorage.setItem(KEYS.updateOnMobileData, String(updateOnMobileData));
  }, [updateOnMobileData]);

  return (
    <SettingsContext.Provider
      value={{
        unit,
        setUnit: setUnitState,
        language,
        setLanguage: setLanguageState,
        updateOnMobileData,
        setUpdateOnMobileData: setUpdateOnMobileDataState,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
