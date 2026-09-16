import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import { useState } from "react";
import { fetchNearestLocation } from "../api/geo";

export type LocationStatus = "idle" | "locating" | "resolved" | "denied" | "unsupported" | "error";

export type ResolvedLocation = { provinceId: string; districtId: string | null };

const GEO_OPTIONS = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

/** Resolves the device's location to the nearest seeded province, plus a district within it
 * when the reverse-geocoded address text matches one (see geo.service.ts on the backend —
 * districts have no coordinates of their own, so this is a best-effort match, not guaranteed).
 * Uses Capacitor's native Geolocation plugin when running as the packaged Android app (real
 * GPS via the OS, no browser secure-context restriction), falling back to the browser's
 * navigator.geolocation on the web. Does nothing until `request()` is called — the caller
 * should ask the visitor first (see LocationPrompt) rather than firing a permission dialog
 * unprompted. */
export function useDeviceLocationProvince(onResolved: (location: ResolvedLocation) => void) {
  const [status, setStatus] = useState<LocationStatus>("idle");

  async function resolveFromCoords(lat: number, lng: number) {
    try {
      const { province, district } = await fetchNearestLocation(lat, lng);
      onResolved({ provinceId: province.id, districtId: district?.id ?? null });
      setStatus("resolved");
    } catch {
      setStatus("error");
    }
  }

  async function requestNative() {
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location === "denied") {
        setStatus("denied");
        return;
      }
      const pos = await Geolocation.getCurrentPosition(GEO_OPTIONS);
      await resolveFromCoords(pos.coords.latitude, pos.coords.longitude);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setStatus(/denied/i.test(message) ? "denied" : "error");
    }
  }

  function requestWeb() {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (import.meta.env.DEV) {
          console.debug(
            `[geolocation] lat=${pos.coords.latitude} lng=${pos.coords.longitude} accuracy=${pos.coords.accuracy}m`
          );
        }
        resolveFromCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      // enableHighAccuracy asks the device to use GPS instead of falling back to coarse
      // WiFi/cell-tower (or even IP-based) positioning, which can be off by tens of km.
      GEO_OPTIONS
    );
  }

  function request() {
    setStatus("locating");
    if (Capacitor.isNativePlatform()) {
      requestNative();
    } else {
      requestWeb();
    }
  }

  return { status, request };
}
