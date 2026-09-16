// ImageProcessorStudio.jsx - Client-Side 16:9 Canvas Crop, WebP Compression & Carousel Preview
'use client';

import { useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { processImageFile } from '@/lib/imageProcessor';

export default function ImageProcessorStudio({ heroImage, carouselImages = [], onUpdateImages }) {
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setProcessing(true);
    try {
      const processedResults = [];
      for (const file of files) {
        const res = await processImageFile(file, 1280, 720, 0.82);
        processedResults.push(res);
      }

      const newUrls = processedResults.map(r => r.dataUrl);
      const updatedCarousel = [...carouselImages, ...newUrls];
      const updatedHero = heroImage || newUrls[0];

      onUpdateImages({
        heroImage: updatedHero,
        carouselImages: updatedCarousel
      });

      const firstStat = processedResults[0];
      setStats({
        originalKB: firstStat.originalSizeKB,
        compressedKB: firstStat.compressedSizeKB,
        aspectRatio: firstStat.aspectRatio,
        count: processedResults.length
      });
    } catch (err) {
      console.error('[Image Processing Error]', err);
      alert('Error processing image. Please ensure valid JPG/PNG/WebP format.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const nextCarousel = carouselImages.filter((_, idx) => idx !== indexToRemove);
    const nextHero = nextCarousel.length > 0 ? nextCarousel[0] : '';
    onUpdateImages({
      heroImage: nextHero,
      carouselImages: nextCarousel
    });
  };

  const handleSetHero = (url) => {
    onUpdateImages({
      heroImage: url,
      carouselImages
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-teal-400" />
          <div>
            <h4 className="text-sm font-bold text-white">16:9 Image Studio & Mobile Optimization</h4>
            <p className="text-[11px] text-slate-400">Auto-crops to exact 16:9 ratio and converts to WebP</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
          Canvas Engine Ready
        </span>
      </div>

      {/* Upload Zone */}
      <div className="relative border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-2xl p-6 text-center transition-colors bg-slate-950/40">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          disabled={processing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="space-y-2 pointer-events-none">
          {processing ? (
            <div className="flex flex-col items-center gap-2 text-teal-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-xs font-bold">Cropping to 16:9 & Compressing WebP...</span>
            </div>
          ) : (
            <>
              <Upload className="w-7 h-7 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-200">
                Drag & drop photos or <span className="text-teal-400 underline">browse files</span>
              </p>
              <p className="text-[10px] text-slate-500">
                Any resolution accepted • Automatically resized to 1280x720 (16:9) • Mobile-optimized
              </p>
            </>
          )}
        </div>
      </div>

      {/* Optimization Stats Badge */}
      {stats && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Processed {stats.count} image(s) to 16:9 WebP ({stats.originalKB}KB → {stats.compressedKB}KB)
            </span>
          </div>
          <span className="font-bold text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-md">
            ~{Math.round((1 - stats.compressedKB / (stats.originalKB || 1)) * 100)}% Lighter
          </span>
        </div>
      )}

      {/* Multi-Image Carousel Preview */}
      {carouselImages.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            Carousel Preview ({carouselImages.length} {carouselImages.length === 1 ? 'image' : 'images'}):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {carouselImages.map((imgUrl, idx) => {
              const isHero = heroImage === imgUrl;
              return (
                <div
                  key={idx}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 group bg-slate-950 ${
                    isHero ? 'border-teal-400 shadow-md' : 'border-slate-800'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Preview slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Hero Badge */}
                  {isHero && (
                    <span className="absolute top-1 left-1 bg-teal-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded">
                      HERO (16:9)
                    </span>
                  )}
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!isHero && (
                      <button
                        type="button"
                        onClick={() => handleSetHero(imgUrl)}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded"
                      >
                        Set Hero
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
