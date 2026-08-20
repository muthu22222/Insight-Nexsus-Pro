"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Store } from "@/types";

interface MapComponentProps {
  center: { lat: number; lng: number };
  stores: Store[];
  selectedStore: Store | null;
  onStoreSelect: (store: Store) => void;
}

export default function MapComponent({
  center,
  stores,
  selectedStore,
  onStoreSelect,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Fix default Leaflet icon paths in Next.js/Webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Initialize map
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([center.lat || 19.076, center.lng || 72.8777], 13);

    // Add OpenStreetMap Tile Layer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Trigger map resize calculation
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update user location marker & center view
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !center.lat || !center.lng) return;

    map.setView([center.lat, center.lng], map.getZoom() || 13);

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:26px;height:26px;background:rgba(37,99,235,0.3);border-radius:50%;animation:pulse 2s infinite;"></div>
          <div style="width:14px;height:14px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);position:relative;z-index:2;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const userMarker = L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:inherit;padding:4px 2px;">
          <h4 style="font-weight:700;font-size:13px;color:#1e293b;margin:0 0 2px 0;">📍 Your Location</h4>
          <p style="font-size:11px;color:#64748b;margin:0;">Showing nearby furniture stores in your area</p>
        </div>`
      );

    userMarkerRef.current = userMarker;
  }, [center]);

  // Update Store Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    stores.forEach((store) => {
      if (!store.lat || !store.lng) return;

      const isSelected = selectedStore?._id === store._id;
      const markerColor = isSelected ? "#2563eb" : "#e11d48";

      const storeIcon = L.divIcon({
        className: "custom-store-marker",
        html: `
          <div style="width:30px;height:30px;background:${markerColor};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;transition:all 0.2s;">
            <span style="transform:rotate(45deg);color:white;font-size:12px;font-weight:bold;">★</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -32],
      });

      const popupContent = `
        <div style="font-family:inherit;min-width:210px;padding:4px 2px;">
          <div style="display:flex;align-items:center;justify-content:between;gap:6px;margin-bottom:4px;">
            <h3 style="font-weight:700;font-size:14px;color:#0f172a;margin:0;">${store.name}</h3>
          </div>
          <p style="font-size:11px;color:#64748b;margin:0 0 6px 0;line-height:1.4;">${store.address}</p>
          <div style="font-size:11px;font-weight:600;color:#059669;margin-bottom:8px;">★ ${store.rating || 4.5} Rating · ${store.category || "Furniture & Decor"}</div>
          <div style="display:flex;gap:6px;padding-top:6px;border-top:1px solid #f1f5f9;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}" target="_blank" rel="noopener noreferrer" style="flex:1;text-align:center;padding:5px 8px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;font-size:11px;font-weight:600;">Directions</a>
            ${store.phone ? `<a href="tel:${store.phone}" style="padding:5px 8px;background:#f8fafc;border:1px solid #e2e8f0;color:#334155;text-decoration:none;border-radius:6px;font-size:11px;font-weight:600;">Call</a>` : ""}
            ${store.website ? `<a href="${store.website}" target="_blank" rel="noopener noreferrer" style="padding:5px 8px;background:#f8fafc;border:1px solid #e2e8f0;color:#334155;text-decoration:none;border-radius:6px;font-size:11px;font-weight:600;">Web</a>` : ""}
          </div>
        </div>
      `;

      const marker = L.marker([store.lat, store.lng], { icon: storeIcon })
        .addTo(map)
        .bindPopup(popupContent);

      marker.on("click", () => {
        onStoreSelect(store);
      });

      markersRef.current.push(marker);
    });
  }, [stores, selectedStore, onStoreSelect]);

  // Focus selected store
  useEffect(() => {
    if (!selectedStore) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([selectedStore.lat, selectedStore.lng], 15, {
      duration: 1.2,
    });

    const marker = markersRef.current.find((m) => {
      const pos = m.getLatLng();
      return (
        Math.abs(pos.lat - selectedStore.lat) < 0.0001 &&
        Math.abs(pos.lng - selectedStore.lng) < 0.0001
      );
    });

    if (marker) {
      marker.openPopup();
    }
  }, [selectedStore]);

  return (
    <div className="relative h-full w-full">
      <div id="map" ref={mapRef} className="h-full w-full z-0" />
    </div>
  );
}
