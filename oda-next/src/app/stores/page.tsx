"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Phone,
  Globe,
  Navigation,
  Loader2,
  Menu,
  Store,
  X,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import BackButton from "@/components/common/BackButton";
import type { Store as StoreType } from "@/types";

const categories = ["All", "Furniture", "Home Decor", "Lighting", "Curtains", "Mattress"];

const defaultLocation = { lat: 19.076, lng: 72.8777 };

export default function StoresPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [searchLocation, setSearchLocation] = useState("");
  const [userLocation, setUserLocation] = useState(defaultLocation);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [mapReady, setMapReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet/dist/leaflet.css").catch(() => {});
      import("@/components/stores/MapComponent").then((mod) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMapComponent(() => mod.default as React.ComponentType<any>);
        setMapReady(true);
      });
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation(defaultLocation);
        }
      );
    }
  }, []);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
      });
      if (category !== "All") params.set("category", category);
      if (searchLocation) params.set("q", searchLocation);

      const res = await fetch(`/api/stores/nearby?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const list = Array.isArray(data.data)
            ? data.data
            : data.data.stores || [];
          setStores(list);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [userLocation, category, searchLocation]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStores();
  };

  const getDirectionsUrl = (store: StoreType) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <BackButton fallbackHref="/dashboard" label="Back" variant="subtle" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Nearby Stores</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Find furniture and home decor stores near you
            </p>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search by location..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">
            <div className="w-full lg:w-80 shrink-0 overflow-y-auto space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : stores.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <Store className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No stores found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search or category
                  </p>
                </div>
              ) : (
                stores.map((store) => (
                  <motion.div
                    key={store._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedStore(store)}
                    className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedStore?._id === store._id
                        ? "border-blue-500 ring-2 ring-blue-100"
                        : "border-gray-100"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {store.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {store.address}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      {store.phone && (
                        <a
                          href={`tel:${store.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          Call
                        </a>
                      )}
                      {store.website && (
                        <a
                          href={store.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
                      )}
                      <a
                        href={getDirectionsUrl(store)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Navigation className="h-3 w-3" />
                        Directions
                      </a>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 bg-gray-200 min-h-[300px] relative">
              {mapReady && MapComponent ? (
                <MapComponent
                  center={userLocation}
                  stores={stores}
                  selectedStore={selectedStore}
                  onStoreSelect={setSelectedStore}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
            </div>
          </div>

          {selectedStore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-white rounded-2xl border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedStore.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedStore.address}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    {selectedStore.phone && (
                      <a
                        href={`tel:${selectedStore.phone}`}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedStore.phone}
                      </a>
                    )}
                    {selectedStore.website && (
                      <a
                        href={selectedStore.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.round(selectedStore.rating)
                            ? "text-amber-400"
                            : "text-gray-300"
                        }`}
                      >
                        &#9733;
                      </span>
                    ))}
                    <span className="text-sm text-gray-500 ml-1">
                      ({selectedStore.rating})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStore(null)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <a
                  href={getDirectionsUrl(selectedStore)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-shadow"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
                {selectedStore.phone && (
                  <a
                    href={`tel:${selectedStore.phone}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      <AIAssistant />
    </div>
  );
}
