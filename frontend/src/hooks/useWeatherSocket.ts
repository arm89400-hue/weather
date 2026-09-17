import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useNetworkType } from "./useNetworkType";

// undefined (not a URL) means "connect to whatever origin served this page" — socket.io-client
// treats that as same-origin, matching the /socket.io proxy in frontend/nginx.conf. Set
// VITE_API_URL only for local (non-Docker) dev, where frontend/backend are separate origins.
const SOCKET_URL = import.meta.env.VITE_API_URL || undefined;

type WeatherUpdatedEvent = { provinceId: string; stationId: string; kind: "reading" | "forecast" };

/** Joins the room for `provinceId` and invalidates the relevant queries on live updates. */
export function useWeatherSocket(provinceId: string | null) {
  const { accessToken } = useAuth();
  const { updateOnMobileData } = useSettings();
  const networkType = useNetworkType();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Network type is only ever known on Chromium (Android WebView/Chrome); everywhere else
  // (Safari/iOS) it reports "unknown" and we fail open rather than disabling live updates for a
  // toggle those users could never have meaningfully set.
  const liveUpdatesAllowed = updateOnMobileData || networkType !== "cellular";

  useEffect(() => {
    if (!liveUpdatesAllowed) return;

    // Weather updates are public — connect whether or not the visitor is signed in. Passing
    // the token when present lets it double as an authenticated connection once they log in.
    const s = io(SOCKET_URL, { auth: accessToken ? { token: accessToken } : {} });

    s.on("weather:updated", (event: WeatherUpdatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["weather", "current", event.provinceId] });
      queryClient.invalidateQueries({ queryKey: ["weather", "forecast", event.provinceId] });
    });

    s.on("connect", () => setSocket(s));

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [accessToken, queryClient, liveUpdatesAllowed]);

  useEffect(() => {
    if (!socket || !provinceId) return;

    socket.emit("subscribe:province", provinceId);
    return () => {
      socket.emit("unsubscribe:province", provinceId);
    };
  }, [socket, provinceId]);
}
