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
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import BackButton from "@/components/common/BackButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
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
          if (data.center && data.center.lat && data.center.lng) {
            setUserLocation(data.center);
          }
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
    if (store.lat && store.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${store.name} ${store.address}`
    )}`;
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md px-4 sm:px-6 py-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-[#F1F3F5] transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5 text-[#0F172A]" />
          </button>
          <BackButton fallbackHref="/dashboard" label="Back to Dashboard" variant="subtle" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Nearby Furniture Stores</h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Discover real showroom furniture stores near your location
            </p>
          </div>
          <ThemeToggle />
        </header>

        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          {/* Search bar & Category select */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search city, area, or address..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F172A]"
              />
            </form>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-white text-[#0F172A]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">
            {/* Left list of stores */}
            <div className="w-full lg:w-80 shrink-0 overflow-y-auto space-y-3 pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0F172A]" />
                </div>
              ) : stores.length === 0 ? (
                <div className="bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] p-8 text-center">
                  <Store className="h-10 w-10 text-[#64748B] mx-auto mb-3" />
                  <p className="text-[#0F172A] font-bold">No stores found</p>
                  <p className="text-xs text-[#64748B] mt-1">
                    Try adjusting your search location or category
                  </p>
                </div>
              ) : (
                stores.map((store) => (
                  <motion.div
                    key={store._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedStore(store)}
                    className={`bg-[#F8F9FA] rounded-xl border p-4 cursor-pointer transition-all hover:border-[#CBD5E1] hover:bg-white hover:shadow-sm ${
                      selectedStore?._id === store._id
                        ? "border-[#0F172A] ring-2 ring-[#0F172A]/20 bg-white"
                        : "border-[#E2E8F0]"
                    }`}
                  >
                    <h3 className="font-bold text-[#0F172A] text-sm">
                      {store.name}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#64748B] shrink-0" />
                      {store.address}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      {store.phone && (
                        <a
                          href={`tel:${store.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors"
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
                          className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors"
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
                        className="flex items-center gap-1 text-xs text-[#0F172A] font-bold hover:underline transition-colors"
                      >
                        <Navigation className="h-3 w-3" />
                        Directions
                      </a>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Right Map Canvas */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#F8F9FA] min-h-[300px] relative shadow-lg">
              {mapReady && MapComponent ? (
                <MapComponent
                  center={userLocation}
                  stores={stores}
                  selectedStore={selectedStore}
                  onStoreSelect={setSelectedStore}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0F172A]" />
                </div>
              )}
            </div>
          </div>

          {/* Selected store bottom sheet */}
          {selectedStore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] p-6 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">
                    {selectedStore.name}
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#64748B]" />
                    {selectedStore.address}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    {selectedStore.phone && (
                      <a
                        href={`tel:${selectedStore.phone}`}
                        className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
                      >
                        <Phone className="h-4 w-4 text-[#64748B]" />
                        {selectedStore.phone}
                      </a>
                    )}
                    {selectedStore.website && (
                      <a
                        href={selectedStore.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
                      >
                        <Globe className="h-4 w-4 text-[#64748B]" />
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
                            : "text-slate-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-xs text-[#64748B] ml-1">
                      ({selectedStore.rating})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStore(null)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#F1F3F5] text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-[#E2E8F0]">
                <a
                  href={getDirectionsUrl(selectedStore)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-extrabold rounded-xl border border-[#0F172A] shadow-md hover:scale-[1.02] transition-transform"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
                {selectedStore.phone && (
                  <a
                    href={`tel:${selectedStore.phone}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#0F172A] text-sm font-semibold rounded-xl hover:bg-[#F1F3F5] transition-colors"
                  >
                    <Phone className="h-4 w-4 text-[#64748B]" />
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
