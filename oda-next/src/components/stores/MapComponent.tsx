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

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([center.lat, center.lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([center.lat, center.lng], map.getZoom());

    const userIcon = L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup("Your location");
  }, [center]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    stores.forEach((store) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;background:#ef4444;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:white;font-size:11px;font-weight:bold;">&#9733;</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([store.lat, store.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:180px;">
            <h3 style="font-weight:600;font-size:14px;margin:0 0 4px 0;">${store.name}</h3>
            <p style="font-size:12px;color:#6b7280;margin:0 0 8px 0;">${store.address}</p>
            ${store.phone ? `<p style="font-size:12px;margin:0 0 4px 0;"><a href="tel:${store.phone}" style="color:#2563eb;">${store.phone}</a></p>` : ""}
            <div style="display:flex;gap:8px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}" target="_blank" style="font-size:12px;color:#2563eb;">Directions</a>
              ${store.website ? `<a href="${store.website}" target="_blank" style="font-size:12px;color:#2563eb;">Website</a>` : ""}
            </div>
          </div>`
        );

      marker.on("click", () => onStoreSelect(store));
      markersRef.current.push(marker);
    });
  }, [stores, onStoreSelect]);

  useEffect(() => {
    if (!selectedStore) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([selectedStore.lat, selectedStore.lng], 15, { animate: true });

    const marker = markersRef.current.find(
      (m) =>
        m.getLatLng().lat === selectedStore.lat &&
        m.getLatLng().lng === selectedStore.lng
    );
    if (marker) {
      marker.openPopup();
    }
  }, [selectedStore]);

  return <div ref={mapRef} className="h-full w-full" />;
}
