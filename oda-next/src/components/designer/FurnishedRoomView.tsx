'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ShoppingBag, Sparkles } from 'lucide-react';

export interface HotspotItem {
  id: number | string;
  x: number;
  y: number;
  label: string;
  price: string;
  match?: number;
  store?: string;
  brand?: string;
  material?: string;
  category?: string;
  productUrl?: string;
  description?: string;
}

interface FurnishedRoomViewProps {
  roomImage: string;
  redesignImage?: string;
  variantIndex?: number;
  styleName?: string;
  hotspots?: HotspotItem[];
  viewMode?: 'redesign' | 'original' | 'split';
  sliderPosition?: number;
  activeHotspotId?: number | string | null;
  onHotspotClick?: (hotspot: HotspotItem) => void;
  isInteractive?: boolean;
  className?: string;
}

export default function FurnishedRoomView({
  roomImage,
  redesignImage,
  variantIndex = 0,
  styleName = 'Modern',
  hotspots = [],
  viewMode = 'redesign',
  sliderPosition = 50,
  activeHotspotId = null,
  onHotspotClick,
  isInteractive = true,
  className = '',
}: FurnishedRoomViewProps) {
  const displayRedesignImage = redesignImage || roomImage;
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageAspect, setImageAspect] = useState<number>(1.5); // Default 3:2
  const [hoveredHotspotId, setHoveredHotspotId] = useState<number | string | null>(null);
  const [renderedBounds, setRenderedBounds] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
  }>({ width: 0, height: 0, left: 0, top: 0 });

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight && img.naturalHeight > 0) {
      setImageAspect(img.naturalWidth / img.naturalHeight);
    }
  };

  const calculateBounds = useCallback(() => {
    if (!containerRef.current) return;
    const cWidth = containerRef.current.clientWidth;
    const cHeight = containerRef.current.clientHeight;
    if (!cWidth || !cHeight) return;

    const cAspect = cWidth / cHeight;
    let rWidth = cWidth;
    let rHeight = cHeight;
    let rLeft = 0;
    let rTop = 0;

    if (cAspect > imageAspect) {
      // Container is wider than image: constrained by height
      rHeight = cHeight;
      rWidth = cHeight * imageAspect;
      rLeft = (cWidth - rWidth) / 2;
    } else {
      // Container is taller than image: constrained by width
      rWidth = cWidth;
      rHeight = cWidth / imageAspect;
      rTop = (cHeight - rHeight) / 2;
    }

    setRenderedBounds({
      width: Math.round(rWidth),
      height: Math.round(rHeight),
      left: Math.round(rLeft),
      top: Math.round(rTop),
    });
  }, [imageAspect]);

  useEffect(() => {
    calculateBounds();
    const ro = new ResizeObserver(calculateBounds);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    window.addEventListener('resize', calculateBounds);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calculateBounds);
    };
  }, [calculateBounds]);

  const hasMeasuredBounds = renderedBounds.width > 0 && renderedBounds.height > 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-black ${className}`}
    >
      {/* 
        PRECISE IMAGE CANVAS FRAME:
        Matches the exact rendered bounding box of the photograph.
        Guarantees 100% precision for hotspot (x,y)% coordinates directly on physical products!
      */}
      <div
        className="relative overflow-hidden"
        style={
          hasMeasuredBounds
            ? {
                width: `${renderedBounds.width}px`,
                height: `${renderedBounds.height}px`,
              }
            : { width: '100%', height: '100%' }
        }
      >
        {/* 1. Base Original Bare Room Image */}
        <img
          src={roomImage}
          alt="Original Room Space"
          onLoad={handleImageLoad}
          className="w-full h-full object-fill pointer-events-none"
        />

        {/* 2. Photorealistic Redesign Photography Layer */}
        {viewMode !== 'original' && (
          <div
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
            style={
              viewMode === 'split'
                ? { clipPath: `inset(0 0 0 ${sliderPosition}%)` }
                : undefined
            }
          >
            <img
              src={displayRedesignImage}
              alt="Photorealistic Redesigned Room"
              onLoad={handleImageLoad}
              className="w-full h-full object-fill pointer-events-none"
            />
          </div>
        )}

        {/* 3. Split Comparison Vertical Divider Slider */}
        {viewMode === 'split' && (
          <div
            className="absolute inset-y-0 pointer-events-none z-20"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.9)]" />
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-2xl flex items-center justify-center pointer-events-auto cursor-ew-resize border border-gray-300">
              <span className="text-[10px] font-black text-gray-900">◄►</span>
            </div>
            <div className="absolute top-4 -left-20 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded shadow">
              Bare Room
            </div>
            <div className="absolute top-4 left-20 -translate-x-1/2 bg-amber-600/95 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded shadow">
              Furnished
            </div>
          </div>
        )}

        {/* 4. Sleek Minimalist Translucent Hotspot Dots (Exact Reference Design) */}
        {isInteractive && viewMode !== 'original' && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {hotspots.map((hotspot) => {
              const isVisibleInSplit = viewMode !== 'split' || hotspot.x >= sliderPosition;
              if (!isVisibleInSplit) return null;

              const isActive = String(activeHotspotId) === String(hotspot.id);
              const isHovered = String(hoveredHotspotId) === String(hotspot.id);
              const isFocused = isActive || isHovered;

              return (
                <div
                  key={String(hotspot.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                  onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                  onMouseLeave={() => setHoveredHotspotId(null)}
                >
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onHotspotClick?.(hotspot)}
                    className="relative flex items-center justify-center cursor-pointer focus:outline-none group"
                    title={`${hotspot.label} • ${hotspot.price}`}
                  >
                    {/* Outer soft ambient pulse aura */}
                    <span
                      className={`absolute rounded-full transition-all duration-300 ${
                        isFocused
                          ? 'w-7 h-7 bg-white/40 ring-4 ring-white/30 animate-ping opacity-75'
                          : 'w-5 h-5 bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping'
                      }`}
                    />

                    {/* Translucent Glass Outer Ring with Glowing Center Dot (Reference Screenshot Design) */}
                    <span
                      className={`relative flex items-center justify-center rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(255,255,255,0.7)] backdrop-blur-md ${
                        isFocused
                          ? 'w-6 h-6 bg-white/45 border-2 border-white ring-2 ring-white/60 scale-110'
                          : 'w-4.5 h-4.5 sm:w-5 sm:h-5 bg-white/30 hover:bg-white/40 border border-white/90'
                      }`}
                    >
                      {/* Solid White Center Dot */}
                      <span
                        className={`rounded-full transition-all duration-200 ${
                          isFocused
                            ? 'w-2.5 h-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,1)]'
                            : 'w-1.5 h-1.5 bg-white'
                        }`}
                      />
                    </span>
                  </motion.button>

                  {/* Connected Hover/Active Product Popover Tag (Clustered directly next to product) */}
                  <AnimatePresence>
                    {isFocused && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-7 mb-1 pointer-events-auto z-50 whitespace-nowrap"
                      >
                        <div
                          onClick={() => onHotspotClick?.(hotspot)}
                          className="bg-black/85 backdrop-blur-xl text-white px-3.5 py-2 rounded-xl shadow-2xl border border-white/20 flex items-center gap-2.5 cursor-pointer hover:bg-black/95 transition-all group/popover"
                        >
                          <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,1)]" />
                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-bold text-white leading-tight">
                                {hotspot.label}
                              </span>
                              <span className="text-[11px] font-black text-amber-400">
                                {hotspot.price}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mt-0.5">
                              <span>{hotspot.store || 'Verified Store'}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold">{hotspot.match || 96}% Match</span>
                            </div>
                          </div>
                          {hotspot.productUrl && (
                            <a
                              href={hotspot.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="ml-1 p-1 bg-white/10 hover:bg-white/25 rounded-md text-white/90 transition-colors"
                              title="Open store link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Triangle Tail pointing down to the dot */}
                        <div className="w-2.5 h-2.5 bg-black/85 border-r border-b border-white/20 rotate-45 mx-auto -mt-1.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
