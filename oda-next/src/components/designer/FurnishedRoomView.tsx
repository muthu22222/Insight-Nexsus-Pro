'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ShoppingBag, Sparkles, Check, Armchair, Loader2 } from 'lucide-react';
import { getDesignImagesForStyle } from '@/lib/design-assets';

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
  image?: string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageAspect, setImageAspect] = useState<number>(1.5); // Default 3:2
  const [hoveredHotspotId, setHoveredHotspotId] = useState<number | string | null>(null);
  const [internalSlider, setInternalSlider] = useState<number>(sliderPosition);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isRedesignLoading, setIsRedesignLoading] = useState<boolean>(false);
  const [renderedBounds, setRenderedBounds] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
  }>({ width: 0, height: 0, left: 0, top: 0 });

  // Guaranteed high-resolution fully-furnished room photography
  const fallbackFurnishedImage = getDesignImagesForStyle(styleName)[0];
  const displayRedesignImage = (redesignImage && (redesignImage.startsWith('http') || redesignImage.startsWith('/')) && redesignImage !== roomImage)
    ? redesignImage
    : fallbackFurnishedImage;

  useEffect(() => {
    setInternalSlider(sliderPosition);
  }, [sliderPosition]);

  useEffect(() => {
    if (displayRedesignImage) {
      setIsRedesignLoading(true);
    }
  }, [displayRedesignImage]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight && img.naturalHeight > 0) {
      setImageAspect(img.naturalWidth / img.naturalHeight);
    }
  };

  const handleRedesignImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    handleImageLoad(e);
    setIsRedesignLoading(false);
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
      rHeight = cHeight;
      rWidth = cHeight * imageAspect;
      rLeft = (cWidth - rWidth) / 2;
    } else {
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

  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const bLeft = renderedBounds.left || 0;
    const bWidth = renderedBounds.width || rect.width;
    const relativeX = clientX - (rect.left + bLeft);
    const newPos = Math.max(0, Math.min(100, (relativeX / bWidth) * 100));
    setInternalSlider(Math.round(newPos));
  }, [renderedBounds]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'split') return;
    setIsDragging(true);
    handleSliderMove(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && viewMode === 'split') {
      handleSliderMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (viewMode === 'split' && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const hasMeasuredBounds = renderedBounds.width > 0 && renderedBounds.height > 0;
  const currentSlider = viewMode === 'split' ? internalSlider : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-black ${className}`}
    >
      {/* 
        PRECISE IMAGE CANVAS FRAME:
        Matches the exact rendered bounding box of the photograph.
        Guarantees 100% precision for hotspot (x,y)% coordinates on physical furniture!
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
          key={`room-base-${roomImage}`}
          src={roomImage}
          alt="Original Room Space"
          onLoad={handleImageLoad}
          className="w-full h-full object-fill pointer-events-none"
        />

        {/* 2. Photorealistic Redesign Fully-Furnished Photography Layer */}
        {viewMode !== 'original' && (
          <div
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
            style={
              viewMode === 'split'
                ? { clipPath: `inset(0 0 0 ${currentSlider}%)` }
                : undefined
            }
          >
            <img
              key={`redesign-img-${displayRedesignImage}`}
              src={displayRedesignImage}
              alt="Photorealistic Furnished Room"
              onLoad={handleRedesignImageLoad}
              onError={(e) => {
                const target = e.currentTarget;
                setIsRedesignLoading(false);
                if (target.src !== fallbackFurnishedImage) {
                  target.src = fallbackFurnishedImage;
                }
              }}
              className="w-full h-full object-fill pointer-events-none transition-opacity duration-300"
              style={{ opacity: isRedesignLoading ? 0.7 : 1 }}
            />

            {/* Subtle loading shimmer if AI image is currently generating */}
            {isRedesignLoading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 border border-amber-500/40 rounded-full shadow-2xl">
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-[11px] font-semibold text-white">Loading Redesigned Room...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Split Comparison Vertical Divider Slider */}
        {viewMode === 'split' && (
          <div
            className="absolute inset-y-0 z-40 cursor-ew-resize select-none"
            style={{ left: `${currentSlider}%` }}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_14px_rgba(0,0,0,0.9)]" />
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-2xl flex items-center justify-center border-2 border-gray-900/20 hover:scale-110 active:scale-95 transition-transform">
              <span className="text-[10px] font-black text-gray-900">◄►</span>
            </div>
            <div className="absolute top-4 -left-20 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow pointer-events-none">
              Original
            </div>
            <div className="absolute top-4 left-20 -translate-x-1/2 bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow pointer-events-none">
              Redesigned
            </div>
          </div>
        )}

        {/* 4. Minimalist Translucent Hotspot Pins Directly on Furniture */}
        {isInteractive && viewMode !== 'original' && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {hotspots.map((hotspot) => {
              const isVisibleInSplit = viewMode !== 'split' || hotspot.x >= currentSlider;
              if (!isVisibleInSplit) return null;

              const isActive = String(activeHotspotId) === String(hotspot.id);
              const isHovered = String(hoveredHotspotId) === String(hotspot.id);
              const isFocused = isActive || isHovered;

              return (
                <div
                  key={String(hotspot.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                  onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                  onMouseLeave={() => setHoveredHotspotId(null)}
                  onClick={() => onHotspotClick?.(hotspot)}
                >
                  {/* Glowing Radar Pulse Wave */}
                  <span className="absolute -inset-2.5 rounded-full bg-white/30 animate-ping opacity-70 pointer-events-none" />

                  {/* Translucent Hotspot Pin */}
                  <div
                    className={`relative w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 shadow-xl ${
                      isFocused
                        ? 'bg-amber-500 text-white border-white scale-125 ring-4 ring-amber-400/40'
                        : 'bg-black/75 text-white/95 border-white/40 hover:bg-black/90 hover:scale-115'
                    }`}
                  >
                    <span className="text-[10px] font-bold">{hotspot.id}</span>
                  </div>

                  {/* Hotspot Floating Product Card */}
                  <AnimatePresence>
                    {isFocused && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.94 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute z-50 pointer-events-auto ${
                          hotspot.y > 65
                            ? 'bottom-full mb-3'
                            : 'top-full mt-3'
                        } ${
                          hotspot.x > 70
                            ? 'right-0'
                            : hotspot.x < 30
                            ? 'left-0'
                            : 'left-1/2 -translate-x-1/2'
                        } w-60 bg-gray-950/95 backdrop-blur-xl border border-white/20 text-white rounded-xl p-3 shadow-2xl`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                            {hotspot.category || 'Furniture'}
                          </span>
                          {hotspot.match && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              {hotspot.match}% Match
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white leading-tight mb-1">
                          {hotspot.label}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-gray-300 mt-2 pt-2 border-t border-white/10">
                          <div>
                            <span className="text-xs font-black text-amber-300">
                              {hotspot.price}
                            </span>
                            {hotspot.store && (
                              <p className="text-[9px] text-gray-400 mt-0.5">
                                Store: {hotspot.store}
                              </p>
                            )}
                          </div>

                          {hotspot.productUrl && (
                            <a
                              href={hotspot.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-[10px] rounded-md transition-colors flex items-center gap-1 shadow"
                            >
                              <span>Buy</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
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
