import { useEffect, useState } from "react";

type NetworkType = "wifi" | "cellular" | "unknown";

// The Network Information API (navigator.connection) only exists on Chromium — Android WebView
// (this app's Capacitor target) and desktop Chrome support it, Safari/iOS never returns it. When
// it's missing we report "unknown" and callers should fail open (treat as "not cellular") rather
// than silently disabling a feature Safari users could never have toggled anyway.
function detect(): NetworkType {
  const conn = (navigator as unknown as { connection?: { type?: string } }).connection;
  if (!conn?.type) return "unknown";
  if (conn.type === "wifi" || conn.type === "ethernet") return "wifi";
  if (conn.type === "cellular") return "cellular";
  return "unknown";
}

export function useNetworkType(): NetworkType {
  const [type, setType] = useState<NetworkType>(detect);

  useEffect(() => {
    const conn = (navigator as unknown as { connection?: EventTarget }).connection;
    if (!conn) return;
    const handler = () => setType(detect());
    conn.addEventListener("change", handler);
    return () => conn.removeEventListener("change", handler);
  }, []);

  return type;
}
