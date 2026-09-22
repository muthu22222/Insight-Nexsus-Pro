"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Database,
  Copy,
  Check,
  Download,
  Code2,
  Table as TableIcon,
  Clock,
  Layers,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import BackButton from "@/components/common/BackButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import type { Store as StoreType } from "@/types";
import { RAW_STORES, CITY_COORDINATES, getRawStores } from "@/data/raw-stores";

const categories = ["All", "Furniture", "Home Decor", "Lighting", "Curtains", "Mattress"];

const CITIES = [
  { label: "📍 Near Me", key: "near_me" },
  { label: "Coimbatore", key: "coimbatore", lat: 11.0168, lng: 76.9558 },
  { label: "Bangalore", key: "bangalore", lat: 12.9716, lng: 77.5946 },
  { label: "Chennai", key: "chennai", lat: 13.0827, lng: 80.2707 },
  { label: "Mumbai", key: "mumbai", lat: 19.076, lng: 72.8777 },
  { label: "Delhi NCR", key: "delhi", lat: 28.6139, lng: 77.209 },
  { label: "Hyderabad", key: "hyderabad", lat: 17.385, lng: 78.4867 },
  { label: "Pune", key: "pune", lat: 18.5204, lng: 73.8567 },
];

// Default to Coimbatore (the location in the screenshot and major design/textile cluster)
const defaultLocation = { lat: 11.0168, lng: 76.9558 };

const categoryBadgeColors: Record<string, string> = {
  Furniture: "bg-blue-50 text-blue-700 border-blue-200",
  "Home Decor": "bg-rose-50 text-rose-700 border-rose-200",
  Lighting: "bg-amber-50 text-amber-700 border-amber-200",
  Curtains: "bg-purple-50 text-purple-700 border-purple-200",
  Mattress: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function StoresPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [searchLocation, setSearchLocation] = useState("");
  const [activeCity, setActiveCity] = useState("coimbatore");
  const [userLocation, setUserLocation] = useState(defaultLocation);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  // Raw data modal states
  const [showRawDataModal, setShowRawDataModal] = useState(false);
  const [rawTab, setRawTab] = useState<"json" | "table">("json");
  const [copied, setCopied] = useState(false);

  // Initialize immediately with raw showroom store data (zero-latency instant load)
  const [stores, setStores] = useState<StoreType[]>(() =>
    getRawStores(defaultLocation.lat, defaultLocation.lng, "All")
  );

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

  // Detect user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          setActiveCity("near_me");
          // Re-sort raw stores based on user's exact coordinates immediately
          const initialNearby = getRawStores(loc.lat, loc.lng, category, searchLocation);
          setStores(initialNearby);
        },
        () => {
          // Geolocation denied/unavailable: default location (Coimbatore)
          setUserLocation(defaultLocation);
        }
      );
    }
  }, []);

  const fetchStores = useCallback(
    async (targetLoc = userLocation, targetCategory = category, query = searchLocation) => {
      // 1. Immediately apply raw store data filter so UI is always responsive
      const localFiltered = getRawStores(targetLoc.lat, targetLoc.lng, targetCategory, query);
      if (localFiltered.length > 0) {
        setStores(localFiltered);
      }

      // 2. Fetch from backend API to merge any MongoDB / OSM updates
      setLoading(true);
      try {
        const params = new URLSearchParams({
          lat: targetLoc.lat.toString(),
          lng: targetLoc.lng.toString(),
        });
        if (targetCategory !== "All") params.set("category", targetCategory);
        if (query.trim()) params.set("q", query.trim());

        const res = await fetch(`/api/stores/nearby?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
            setStores(data.data);
            if (data.center && data.center.lat && data.center.lng) {
              setUserLocation(data.center);
            }
          }
        }
      } catch {
        // Fallback already populated with raw stores
      } finally {
        setLoading(false);
      }
    },
    [userLocation, category, searchLocation]
  );

  // Sync when category or userLocation changes
  useEffect(() => {
    fetchStores(userLocation, category, searchLocation);
  }, [category, userLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if query matches city coordinates directly
    const cleanQ = searchLocation.trim().toLowerCase();
    if (CITY_COORDINATES[cleanQ]) {
      const coord = CITY_COORDINATES[cleanQ];
      setUserLocation({ lat: coord.lat, lng: coord.lng });
      setActiveCity(cleanQ);
      fetchStores({ lat: coord.lat, lng: coord.lng }, category, "");
      return;
    }
    fetchStores(userLocation, category, searchLocation);
  };

  const handleCitySelect = (cityItem: (typeof CITIES)[number]) => {
    setActiveCity(cityItem.key);
    if (cityItem.key === "near_me") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setSearchLocation("");
          fetchStores(loc, category, "");
        });
      }
      return;
    }

    if (cityItem.lat && cityItem.lng) {
      const loc = { lat: cityItem.lat, lng: cityItem.lng };
      setUserLocation(loc);
      setSearchLocation("");
      fetchStores(loc, category, "");
    }
  };

  const handleCopyJson = () => {
    const rawDataStr = JSON.stringify(stores, null, 2);
    navigator.clipboard.writeText(rawDataStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const rawDataStr = JSON.stringify(stores, null, 2);
    const blob = new Blob([rawDataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `insight-nexsus-stores-raw-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-4 sm:px-6 py-4 shadow-xs">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5 text-[var(--text-primary)]" />
          </button>
          <BackButton fallbackHref="/dashboard" label="Back to Dashboard" variant="subtle" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Nearby Furniture Stores</h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {stores.length} Showrooms Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Discover real showroom furniture stores with live raw data, directions & contacts
            </p>
          </div>

          {/* Raw Data Action Button */}
          <button
            onClick={() => setShowRawDataModal(true)}
            id="view-raw-data-btn"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#2B1B12] hover:bg-[#433328] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all hover:scale-105 cursor-pointer"
            title="Inspect raw store dataset in JSON or Table format"
          >
            <Database className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Raw Data</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 text-[11px] rounded font-mono">
              {RAW_STORES.length}
            </span>
          </button>

          <ThemeToggle />
        </header>

        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto space-y-4">
          {/* Quick City Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1 shrink-0">
              <Layers className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Hubs:
            </span>
            {CITIES.map((city) => {
              const isSelected = activeCity === city.key;
              return (
                <button
                  key={city.key}
                  onClick={() => handleCitySelect(city)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#2B1B12] text-white shadow-xs font-bold"
                      : "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-secondary)]"
                  }`}
                >
                  {city.label}
                </button>
              );
            })}
          </div>

          {/* Search bar & Category select */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search store name, area, or city (e.g. Peelamedu, Gandhipuram, Bangalore)..."
                className="w-full pl-11 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)] shadow-xs"
              />
            </form>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] cursor-pointer shadow-xs font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[var(--surface)] text-[var(--text-primary)]">
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Content Layout: Left Stores List, Right Map */}
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-270px)] min-h-[520px]">
            {/* Left list of stores */}
            <div className="w-full lg:w-88 shrink-0 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Showrooms ({stores.length})
                </span>
                {loading && (
                  <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--text-primary)]" />
                    Updating...
                  </span>
                )}
              </div>

              {stores.length === 0 ? (
                <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 text-center shadow-xs">
                  <Store className="h-10 w-10 text-[var(--text-secondary)] mx-auto mb-3" />
                  <p className="text-[var(--text-primary)] font-bold">No stores found</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Try adjusting your search or selecting &apos;All Categories&apos;
                  </p>
                  <button
                    onClick={() => {
                      setCategory("All");
                      setSearchLocation("");
                      fetchStores(userLocation, "All", "");
                    }}
                    className="mt-4 px-4 py-2 bg-[#2B1B12] text-white rounded-xl text-xs font-bold hover:bg-[#433328]"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                stores.map((store) => {
                  const isSelected = selectedStore?._id === store._id;

                  return (
                    <motion.div
                      key={store._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedStore(store)}
                      className={`rounded-xl border p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#2B1B12] dark:border-white ring-2 ring-[#2B1B12]/15 bg-[var(--surface)] shadow-md"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-secondary)] hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[var(--text-primary)] text-sm leading-snug">
                          {store.name}
                        </h3>
                        {store.category && (
                          <span
                            className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)]"
                          >
                            {store.category}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 flex items-start gap-1 leading-relaxed">
                        <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{store.address}</span>
                      </p>

                      <div className="flex items-center gap-3 mt-2.5 text-xs">
                        {store.distance !== undefined && (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                            📍 {store.distance} km away
                          </span>
                        )}
                        <span className="text-amber-500 font-bold flex items-center gap-0.5 text-[11px]">
                          ★ {store.rating || 4.5}
                        </span>
                        {store.openingHours && (
                          <span className="text-[var(--text-secondary)] text-[11px] hidden sm:inline flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                            {store.openingHours}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                        {store.phone && (
                          <a
                            href={`tel:${store.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-[var(--text-primary)] hover:border-[var(--text-primary)] px-2.5 py-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg transition-colors font-medium"
                          >
                            <Phone className="h-3 w-3 text-[var(--text-secondary)]" />
                            Call
                          </a>
                        )}
                        {store.website && (
                          <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-[var(--text-primary)] hover:border-[var(--text-primary)] px-2.5 py-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg transition-colors font-medium"
                          >
                            <Globe className="h-3 w-3 text-[var(--text-secondary)]" />
                            Website
                          </a>
                        )}
                        <a
                          href={getDirectionsUrl(store)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-white bg-[#2B1B12] hover:bg-[#433328] px-3 py-1 rounded-lg font-bold ml-auto transition-colors shadow-xs"
                        >
                          <Navigation className="h-3 w-3" />
                          Directions
                        </a>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Right Map Canvas */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-secondary)] min-h-[320px] relative shadow-md">
              {mapReady && MapComponent ? (
                <MapComponent
                  center={userLocation}
                  stores={stores}
                  selectedStore={selectedStore}
                  onStoreSelect={setSelectedStore}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--text-primary)]" />
                </div>
              )}
            </div>
          </div>

          {/* Selected store bottom drawer / card */}
          <AnimatePresence>
            {selectedStore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-6 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xl relative"
              >
                <button
                  onClick={() => setSelectedStore(null)}
                  className="absolute top-5 right-5 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        {selectedStore.name}
                      </h2>
                      {selectedStore.category && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)]">
                          {selectedStore.category}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] mt-1.5 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                      {selectedStore.address}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {selectedStore.distance !== undefined && (
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          📍 {selectedStore.distance} km from your location
                        </span>
                      )}
                      {selectedStore.phone && (
                        <a
                          href={`tel:${selectedStore.phone}`}
                          className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <Phone className="h-4 w-4 text-[var(--text-muted)]" />
                          {selectedStore.phone}
                        </a>
                      )}
                      {selectedStore.openingHours && (
                        <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                          <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                          {selectedStore.openingHours}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < Math.round(selectedStore.rating || 4.5)
                                ? "text-amber-400"
                                : "text-[var(--border)]"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-xs font-bold text-[var(--text-primary)] ml-1">
                          {selectedStore.rating || 4.5}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {selectedStore.website && (
                      <a
                        href={selectedStore.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--surface-secondary)] hover:border-[var(--text-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl text-sm font-semibold transition-colors shadow-xs"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    <a
                      href={getDirectionsUrl(selectedStore)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2B1B12] hover:bg-[#433328] text-white rounded-xl text-sm font-bold transition-all shadow-xs hover:scale-105"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* RAW DATA INSPECTION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showRawDataModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#2B1B12] flex items-center justify-center text-white">
                    <Database className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">Showroom Stores Raw Data</h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                        {stores.length} records active / {RAW_STORES.length} total
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Verified raw store dataset containing geo coordinates, contact details, and categories
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    <span>Download JSON</span>
                  </button>

                  <button
                    onClick={() => setShowRawDataModal(false)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer ml-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center justify-between px-6 py-2 border-b border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRawTab("json")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      rawTab === "json"
                        ? "bg-[#2B1B12] text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    Raw JSON View
                  </button>
                  <button
                    onClick={() => setRawTab("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      rawTab === "table"
                        ? "bg-[#2B1B12] text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                    }`}
                  >
                    <TableIcon className="h-3.5 w-3.5" />
                    Structured Table
                  </button>
                </div>

                <div className="text-xs text-[var(--text-secondary)]">
                  Showing <strong className="text-[var(--text-primary)]">{stores.length}</strong> loaded showroom records
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-auto p-6 bg-[#111827] text-white font-mono text-xs">
                {rawTab === "json" ? (
                  <pre className="whitespace-pre overflow-x-auto text-emerald-400 leading-relaxed selection:bg-emerald-800">
                    {JSON.stringify(stores, null, 2)}
                  </pre>
                ) : (
                  <div className="overflow-x-auto bg-[var(--surface)] rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-sans">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[var(--surface-secondary)] border-b border-[var(--border)] text-[var(--text-primary)] font-bold">
                          <th className="p-3">#</th>
                          <th className="p-3">Store Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Address</th>
                          <th className="p-3">Coordinates (Lat, Lng)</th>
                          <th className="p-3">Rating</th>
                          <th className="p-3">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {stores.map((s, idx) => (
                          <tr key={s._id} className="hover:bg-[var(--surface-secondary)]/50 transition-colors">
                            <td className="p-3 text-[var(--text-muted)] font-mono">{idx + 1}</td>
                            <td className="p-3 font-semibold text-[var(--text-primary)]">{s.name}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-primary)] font-medium border border-[var(--border)]">
                                {s.category || "Furniture"}
                              </span>
                            </td>
                            <td className="p-3 text-[var(--text-secondary)] max-w-xs truncate">{s.address}</td>
                            <td className="p-3 font-mono text-[var(--text-secondary)]">
                              {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                            </td>
                            <td className="p-3 text-amber-500 font-bold">★ {s.rating || 4.5}</td>
                            <td className="p-3 text-[var(--text-secondary)]">{s.phone || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-secondary)] text-xs text-[var(--text-secondary)]">
                <span>
                  Source: <strong className="text-[var(--text-primary)]">Insight Nexsus Verified Showroom Catalog</strong> ({RAW_STORES.length} stores across 7 Indian Metro Hubs)
                </span>
                <button
                  onClick={() => setShowRawDataModal(false)}
                  className="px-4 py-1.5 bg-[#2B1B12] text-white rounded-lg font-bold hover:bg-[#433328] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIAssistant />
    </div>
  );
}
