"use client";

import { useEffect, useRef } from "react";

// Leaflet's stylesheet ships with the npm package. Importing it from a
// `"use client"` file is fine — Next.js statically hoists CSS imports at
// build time; nothing leaflet-related runs on the server.
import "leaflet/dist/leaflet.css";

// Static imports of the default marker PNGs that ship with leaflet. Next.js
// resolves these at build time — the exact shape depends on the bundler
// (Turbopack may hand back a plain URL string, Webpack hands back a
// `StaticImageData` object with `.src`), so we normalise below.
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

/**
 * Extract a URL string from whatever shape the bundler produced for an
 * image import. Handles:
 *   - plain string (`"/foo.png"`)
 *   - StaticImageData (`{ src: "/foo.png", ... }`)
 */
function toUrl(img: unknown): string {
  if (typeof img === "string") return img;
  if (img && typeof img === "object" && "src" in img) {
    const { src } = img as { src: unknown };
    if (typeof src === "string") return src;
  }
  // Should never happen in practice; surface loudly if it does.
  throw new Error("Unable to resolve Leaflet marker icon URL");
}

/**
 * Approximate centre of Spencers Wood, Berkshire (51°23′45″N, 0°59′31″W).
 * Used as the default view when no markers or explicit centre are supplied.
 */
const SPENCERS_WOOD: [number, number] = [51.3958, -0.9919];

export type MapMarker = {
  lat: number;
  lng: number;
  /** Optional HTML/text shown in the marker's popup. */
  label?: string;
};

type MapProps = {
  /** Tailwind height class. Defaults to a comfortable 400px hero-adjacent size. */
  className?: string;
  /** Markers to plot. If more than one is given, the map auto-fits to their bounds. */
  markers?: MapMarker[];
  /** Explicit centre as [lat, lng]. Overrides the default but not `markers`-driven bounds. */
  center?: [number, number];
  /** Initial zoom level when no bounds fitting is performed. */
  zoom?: number;
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
  markers,
  center,
  zoom = 14,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Stabilise the markers identity across renders so the effect doesn't
  // tear down and rebuild the map on every parent re-render. We serialise
  // with JSON since the contents are simple numbers/strings.
  const markersKey = JSON.stringify(markers ?? null);
  const centerKey = JSON.stringify(center ?? null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance: import("leaflet").Map | null = null;

    (async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current) return;

      // Leaflet's default marker icons are referenced by relative URL, which
      // breaks once bundled. Re-point them at the assets shipped in the npm
      // package so markers render correctly.
      //
      // `_getIconUrl` is Leaflet's internal fallback we want to bypass.
      delete (
        L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown }
      )._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: toUrl(markerIconPng),
        iconRetinaUrl: toUrl(markerIcon2xPng),
        shadowUrl: toUrl(markerShadowPng),
      });

      const initialCentre: [number, number] =
        center ??
        (markers && markers.length > 0
          ? [markers[0].lat, markers[0].lng]
          : SPENCERS_WOOD);

      mapInstance = L.map(containerRef.current, {
        center: initialCentre,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      // If `markers` is null / undefined / empty, plot nothing — the caller
      // has explicitly opted out of showing any pins.
      const latLngs: import("leaflet").LatLngTuple[] = [];
      if (markers && markers.length > 0) {
        for (const m of markers) {
          const marker = L.marker([m.lat, m.lng]).addTo(mapInstance);
          if (m.label) marker.bindPopup(m.label);
          latLngs.push([m.lat, m.lng]);
        }
      }

      // Auto-fit the view to all markers only when the caller hasn't pinned
      // the map with an explicit `center`. A single marker keeps the initial
      // centre/zoom either way so the caller can frame it however they like.
      if (!center && latLngs.length > 1) {
        mapInstance.fitBounds(L.latLngBounds(latLngs), { padding: [32, 32] });
      }
    })();

    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
    // `markersKey` / `centerKey` capture the relevant prop identity; `markers`
    // and `center` are read inside the effect but intentionally not in deps
    // to avoid rebuilding on every referential change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markersKey, centerKey, zoom]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label="Map"
    />
  );
}
