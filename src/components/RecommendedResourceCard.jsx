// src/components/RecommendedResourceCard.jsx - User-Side Recommended Resource Card
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import { 
  Sparkles, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  BookmarkCheck
} from 'lucide-react';

export default function RecommendedResourceCard({ resource, index = 0 }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!resource) return null;

  const images = Array.isArray(resource.carouselImages) && resource.carouselImages.length > 0
    ? resource.carouselImages
    : resource.heroImage
    ? [resource.heroImage]
    : [];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <article
      id={`resource-card-${resource.id}-${index}`}
      className="snap-start w-full max-w-xl mx-auto py-2 px-3 sm:px-4 transition-all duration-300"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-teal-500/30 dark:border-teal-500/25 shadow-md shadow-teal-500/5 dark:shadow-teal-950/20 overflow-hidden p-4 sm:p-5 transition-colors relative">
        {/* Accent Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-600" />

        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full shadow-sm">
              <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span>Recommended Resource</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 px-2.5 py-1 rounded-full">
              {resource.category || 'Tools & Software'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Verified</span>
            </span>
          </div>
        </div>

        {/* Main Title & Tagline */}
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug tracking-tight mb-1">
          {resource.headline || resource.title || 'Featured Student Resource'}
        </h2>
        
        {resource.tagline && (
          <p className="text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-400 leading-snug mb-3">
            {resource.tagline}
          </p>
        )}

        {/* Hero / Carousel Image Media */}
        {images.length > 0 && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 mb-3.5 group shadow-inner border border-slate-200/60 dark:border-slate-800">
            {images[activeImageIndex]?.startsWith('data:') ? (
              <img
                src={images[activeImageIndex]}
                alt={resource.headline || resource.title || 'Resource visual'}
                loading="lazy"
                decoding="async"
                className="object-cover transition-transform duration-500 group-hover:scale-105 absolute inset-0 w-full h-full"
              />
            ) : (
              <Image
                src={getOptimizedImageUrl(images[activeImageIndex], { width: 720, quality: 75 })}
                alt={resource.headline || resource.title || 'Resource visual'}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 580px, 600px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}

            {/* Multiple images indicator / navigation */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-950/70 hover:bg-slate-950 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-80 hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-950/70 hover:bg-slate-950 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-80 hover:opacity-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-full">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeImageIndex ? 'w-4 bg-teal-400' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Description Body */}
        {resource.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {resource.description}
          </p>
        )}

        {/* Expandable Read More / Extended Details */}
        {resource.readMore && (
          <div className="mb-3.5">
            {isExpanded && (
              <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                  <BookmarkCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Program Overview & Details</span>
                </div>
                <div className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-400">
                  {resource.readMore}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Show Less' : 'Learn More & Details'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Action Links / External Resources */}
        {Array.isArray(resource.links) && resource.links.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            {resource.links.map((link, lIdx) => (
              <a
                key={lIdx}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${link.label || 'resource'}: ${link.description || 'External resource'}`}
                className="group flex items-center justify-between p-3 bg-gradient-to-r from-teal-500/10 to-emerald-500/5 hover:from-teal-500/20 hover:to-emerald-500/15 border border-teal-500/30 rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate">
                      {link.label || 'Visit Resource'}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 shrink-0 transition-colors" />
                  </div>
                  {link.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {link.description}
                    </p>
                  )}
                </div>

                <span className="shrink-0 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all group-hover:scale-105">
                  Open
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
