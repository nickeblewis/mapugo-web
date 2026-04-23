"use client";

import { useEffect, useRef } from "react";

// Leaflet's stylesheet ships with the npm package. Importing it from a
// `"use client"` file is fine — Next.js statically hoists CSS imports at
// build time; nothing leaflet-related runs on the server.
import "leaflet/dist/leaflet.css";

/**
 * Approximate centre of Spencers Wood, Berkshire (51°23′45″N, 0°59′31″W).
 */
const SPENCERS_WOOD: [number, number] = [51.3958, -0.9919];

type MapProps = {
  /** Tailwind height class. Defaults to a comfortable 400px hero-adjacent size. */
  className?: string;
};

/**
 * Leaflet map rendered entirely on the client.
 *
 * The leaflet module itself references `window` at import time, so we defer
 * loading it until `useEffect` runs in the browser. This is the pattern
 * recommended by Next.js' lazy-loading guide for browser-only libraries —
 * see `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`
 * ("Loading External Libraries").
 *
 * Because leaflet is only ever touched in an effect, this component is safe
 * to render directly from a Server Component parent.
 */
export default function Map({
  className = "h-[360px] md:h-[440px] w-full rounded-2xl overflow-hidden",
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance: import("leaflet").Map | null = null;

    (async () => {
      const L = (await import("leaflet")).default;

      // Leaflet's default marker icons are referenced by relative URL, which
      // breaks once bundled. Re-point them at the assets shipped in the npm
      // package so markers render correctly.
      const [iconUrl, iconRetinaUrl, shadowUrl] = await Promise.all([
        import("leaflet/dist/images/marker-icon.png"),
        import("leaflet/dist/images/marker-icon-2x.png"),
        import("leaflet/dist/images/marker-shadow.png"),
      ]);

      if (cancelled || !containerRef.current) return;

      // `_getIconUrl` is Leaflet's internal fallback we want to bypass.
      delete (
        L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown }
      )._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: iconUrl.default.src,
        iconRetinaUrl: iconRetinaUrl.default.src,
        shadowUrl: shadowUrl.default.src,
      });

      mapInstance = L.map(containerRef.current, {
        center: SPENCERS_WOOD,
        zoom: 14,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      L.marker(SPENCERS_WOOD)
        .addTo(mapInstance)
        .bindPopup("Spencers Wood, Berkshire");
    })();

    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
  }, []);

  return <div ref={containerRef} className={className} aria-label="Map of Spencers Wood, Berkshire" />;
}
