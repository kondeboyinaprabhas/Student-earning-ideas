// src/components/admin/WelcomeHeroManager.jsx
// Admin-managed Welcome Blueprint Card editor — Multi-Image Showcase Gallery + Firebase Storage upload + Firestore settings save
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { getWelcomeHero, setWelcomeHero, DEFAULT_WELCOME_HERO, WELCOME_HERO_IMAGE_DEFAULT } from '@/lib/firestoreStore';
import {
  ImageIcon, Upload, Save, Eye, EyeOff, RefreshCw,
  CheckCircle2, AlertCircle, Loader2, Trash2, Sparkles, Compass,
  ArrowUp, ArrowDown, Plus, Link as LinkIcon
} from 'lucide-react';

export default function WelcomeHeroManager({ showToast }) {
  const [config, setConfig] = useState(DEFAULT_WELCOME_HERO);
  const [trustBadgesInput, setTrustBadgesInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Load current config from Firestore
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getWelcomeHero();
        if (data) {
          const rawImages = Array.isArray(data.images) && data.images.length > 0
            ? data.images.filter(Boolean)
            : (data.imageUrl || data.heroImage ? [data.imageUrl || data.heroImage] : [WELCOME_HERO_IMAGE_DEFAULT]);

          setConfig({
            ...DEFAULT_WELCOME_HERO,
            ...data,
            images: rawImages,
            imageUrl: rawImages[0] || WELCOME_HERO_IMAGE_DEFAULT,
            heroImage: rawImages[0] || WELCOME_HERO_IMAGE_DEFAULT,
          });

          if (Array.isArray(data.trustBadges)) {
            setTrustBadgesInput(data.trustBadges.join(', '));
          } else {
            setTrustBadgesInput(DEFAULT_WELCOME_HERO.trustBadges.join(', '));
          }
        }
      } catch (err) {
        console.error('[WelcomeHeroManager] load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFieldChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleBadgesChange = (value) => {
    setTrustBadgesInput(value);
    const badgesArray = value.split(',').map(s => s.trim()).filter(Boolean);
    setConfig(prev => ({ ...prev, trustBadges: badgesArray }));
    setSaveSuccess(false);
  };

  // Upload multiple images to Firebase Storage → append to config.images
  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError('');
    if (!storage) {
      setUploadError('Firebase Storage is not initialized.');
      return;
    }

    try {
      setUploading(true);
      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
        const fileRef = storageRef(
          storage, 
          `welcome-hero/hero_${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        );
        await uploadBytes(fileRef, file, { contentType: file.type });
        const url = await getDownloadURL(fileRef);
        uploadedUrls.push(url);
      }

      const existingSet = new Set(config.images || []);
      const newUrls = uploadedUrls.filter(u => !existingSet.has(u));

      if (newUrls.length === 0 && uploadedUrls.length > 0) {
        showToast?.('Uploaded images were already in the gallery.');
      } else {
        const updatedImages = [...(config.images || []), ...newUrls];
        setConfig(prev => ({
          ...prev,
          images: updatedImages,
          imageUrl: updatedImages[0] || '',
          heroImage: updatedImages[0] || '',
        }));
        showToast?.(`Added ${newUrls.length} image(s) to Welcome Blueprint!`);
      }
    } catch (err) {
      console.error('[WelcomeHeroManager] multi-upload error:', err);
      setUploadError(`Upload failed: ${err.message}`);
      showToast?.('Some or all image uploads failed. Check Firebase Storage rules.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      setUploadError('Please provide a valid image URL starting with https://');
      return;
    }

    const existingImages = config.images || [];
    if (existingImages.includes(trimmed)) {
      setUploadError('This image URL is already in the gallery.');
      return;
    }

    setUploadError('');
    const updatedImages = [...existingImages, trimmed];
    setConfig(prev => ({
      ...prev,
      images: updatedImages,
      imageUrl: updatedImages[0] || '',
      heroImage: updatedImages[0] || '',
    }));
    setUrlInput('');
    showToast?.('Image URL added to gallery!');
  };

  // Remove image from gallery
  const handleRemoveImage = (index) => {
    const existing = config.images || [];
    const updated = existing.filter((_, i) => i !== index);
    setConfig(prev => ({
      ...prev,
      images: updated,
      imageUrl: updated[0] || '',
      heroImage: updated[0] || '',
    }));
  };

  // Reorder image (move up or down)
  const handleMoveImage = (index, direction) => {
    const arr = [...(config.images || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= arr.length) return;

    const temp = arr[index];
    arr[index] = arr[targetIdx];
    arr[targetIdx] = temp;

    setConfig(prev => ({
      ...prev,
      images: arr,
      imageUrl: arr[0] || '',
      heroImage: arr[0] || '',
    }));
  };

  // Save full config to Firestore
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const badgesArray = trustBadgesInput.split(',').map(s => s.trim()).filter(Boolean);
      const currentImages = Array.isArray(config.images) && config.images.length > 0
        ? config.images.filter(Boolean)
        : [config.imageUrl || config.heroImage || WELCOME_HERO_IMAGE_DEFAULT];
      const primaryImg = currentImages[0] || WELCOME_HERO_IMAGE_DEFAULT;

      const payload = {
        ...config,
        images: currentImages,
        imageUrl: primaryImg,
        heroImage: primaryImg,
        trustBadges: badgesArray.length > 0 ? badgesArray : DEFAULT_WELCOME_HERO.trustBadges,
        heroEnabled: config.enabled !== false,
      };

      const result = await setWelcomeHero(payload);
      if (result?.success !== false) {
        setSaveSuccess(true);
        showToast?.('Welcome Blueprint Card saved successfully!');
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        showToast?.('Save failed. Check Firestore rules.');
      }
    } catch (err) {
      console.error('[WelcomeHeroManager] save error:', err);
      showToast?.('Save failed. Check Firestore rules.');
    } finally {
      setSaving(false);
    }
  };

  const handleReload = () => {
    setLoading(true);
    getWelcomeHero().then(data => {
      if (data) {
        const rawImages = Array.isArray(data.images) && data.images.length > 0
          ? data.images.filter(Boolean)
          : (data.imageUrl || data.heroImage ? [data.imageUrl || data.heroImage] : [WELCOME_HERO_IMAGE_DEFAULT]);

        setConfig({
          ...DEFAULT_WELCOME_HERO,
          ...data,
          images: rawImages,
          imageUrl: rawImages[0] || WELCOME_HERO_IMAGE_DEFAULT,
          heroImage: rawImages[0] || WELCOME_HERO_IMAGE_DEFAULT,
        });

        if (Array.isArray(data.trustBadges)) {
          setTrustBadgesInput(data.trustBadges.join(', '));
        }
      }
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const galleryImages = Array.isArray(config.images) && config.images.length > 0
    ? config.images
    : (config.imageUrl ? [config.imageUrl] : [WELCOME_HERO_IMAGE_DEFAULT]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Loading Welcome Blueprint config&hellip;</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-400" />
              <h2 className="text-base font-bold text-white">Welcome Blueprint Card Editor</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Fixed permanent introduction card at the top of the homepage. All real business ideas shuffle beneath it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleFieldChange('enabled', !config.enabled)}
            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              config.enabled
                ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {config.enabled
              ? <Eye className="w-3.5 h-3.5" />
              : <EyeOff className="w-3.5 h-3.5" />}
            {config.enabled ? 'Visible' : 'Hidden'}
          </button>
        </div>

        {/* Multi-Image Gallery Manager */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-200">
                Showcase Image Gallery (Multi-Image Carousel)
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                The first image (#1) is preloaded with high priority as the LCP element. Visitors browse all images in the saved order via carousel controls.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-teal-400 rounded-lg border border-slate-700">
              {galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Current Gallery List */}
          <div className="space-y-2.5">
            {galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  idx === 0
                    ? 'bg-teal-950/20 border-teal-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                  <Image
                    src={imgUrl}
                    alt={`Blueprint Image ${idx + 1}`}
                    fill
                    sizes="80px"
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* Info & URL */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {idx === 0 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        #1 Primary (LCP Hero)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        #{idx + 1}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-1" title={imgUrl}>
                    {imgUrl}
                  </p>
                </div>

                {/* Reorder & Remove Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveImage(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                    title="Move Up (toward primary)"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveImage(idx, 1)}
                    disabled={idx === galleryImages.length - 1}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    disabled={galleryImages.length <= 1}
                    className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:text-white hover:bg-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Image Options (Storage Upload + Add by URL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Upload Multiple from Firebase Storage */}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-3 px-4 border-2 border-dashed border-slate-700 hover:border-teal-500/50 rounded-xl flex items-center justify-center gap-2 text-slate-300 hover:text-teal-400 transition-colors cursor-pointer bg-slate-950/60"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                ) : (
                  <Upload className="w-4 h-4 text-teal-400" />
                )}
                <span className="text-xs font-semibold">
                  {uploadProgress || (uploading ? 'Uploading...' : 'Upload Images (Firebase Storage)')}
                </span>
              </button>
              <span className="block text-[10px] text-slate-500 mt-1 text-center">
                Select 1 or multiple files &middot; PNG, JPEG, WebP &middot; Max 5MB each
              </span>
            </div>

            {/* Add by URL */}
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
              </div>
              <span className="block text-[10px] text-slate-500 mt-1">
                Enter direct image URL to add to the blueprint showcase
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/webp,image/png,image/jpeg"
            className="hidden"
            onChange={handleMultipleImageUpload}
          />

          {uploadError && (
            <p className="text-xs text-red-400 flex items-center gap-1.5 bg-red-950/30 border border-red-800/40 p-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Primary Content</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              value={config.title}
              onChange={e => handleFieldChange('title', e.target.value)}
              placeholder="e.g. Real Business Blueprints for Indian Students"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tagline</label>
            <input
              type="text"
              value={config.tagline || ''}
              onChange={e => handleFieldChange('tagline', e.target.value)}
              placeholder="e.g. Learn practical earning ideas with complete step-by-step plans."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Introduction (Description)</label>
          <textarea
            rows={3}
            value={config.description}
            onChange={e => handleFieldChange('description', e.target.value)}
            placeholder="e.g. Tested, actionable ways to earn in college with zero upfront capital..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Trust Badges (comma-separated)
          </label>
          <input
            type="text"
            value={trustBadgesInput}
            onChange={e => handleBadgesChange(e.target.value)}
            placeholder="e.g. Zero Investment Options, Step-by-Step Plans, Action Tools, Regular Updates"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(config.trustBadges || []).map((b, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-800 text-teal-300 px-2 py-0.5 rounded-md">
                <Sparkles className="w-2.5 h-2.5 text-teal-400" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Blueprint Preview Sections (Editable) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Blueprint Preview & Explanations</h3>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Blueprint Preview Text</label>
          <input
            type="text"
            value={config.blueprintPreviewText || ''}
            onChange={e => handleFieldChange('blueprintPreviewText', e.target.value)}
            placeholder="e.g. Every blueprint in our collection gives you a complete, practical roadmap:"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">"How It Works" Summary</label>
          <textarea
            rows={2}
            value={config.howItWorksSummary || ''}
            onChange={e => handleFieldChange('howItWorksSummary', e.target.value)}
            placeholder="e.g. Browse verified blueprints, pick one matching your schedule..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Investment Preview</label>
            <input
              type="text"
              value={config.investmentPreview || ''}
              onChange={e => handleFieldChange('investmentPreview', e.target.value)}
              placeholder="e.g. ₹0 – ₹1,000 avg"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Startup Preview</label>
            <input
              type="text"
              value={config.startupPreview || ''}
              onChange={e => handleFieldChange('startupPreview', e.target.value)}
              placeholder="e.g. Free tools & zero-inventory"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Risk Preview</label>
            <input
              type="text"
              value={config.riskPreview || ''}
              onChange={e => handleFieldChange('riskPreview', e.target.value)}
              placeholder="e.g. Zero-debt, skill-first"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Buttons & Scroll Guidance</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Scroll Hint Text (Anchor to #feed)</label>
            <input
              type="text"
              value={config.scrollHintText || ''}
              onChange={e => handleFieldChange('scrollHintText', e.target.value)}
              placeholder="e.g. Explore today's latest blueprints"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Install Button Text</label>
            <input
              type="text"
              value={config.installButtonText || ''}
              onChange={e => handleFieldChange('installButtonText', e.target.value)}
              placeholder="e.g. Install Student Earning Ideas"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-md"
        >
          {saving
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : saveSuccess
              ? <CheckCircle2 className="w-4 h-4" />
              : <Save className="w-4 h-4" />}
          {saving ? 'Saving\u2026' : saveSuccess ? 'Saved!' : 'Save Welcome Blueprint'}
        </button>

        <button
          type="button"
          onClick={handleReload}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload from Firestore
        </button>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Changes take effect on the public homepage immediately without a redeploy.
        Stored in Firestore under <code>settings/welcomeHero</code>.
      </p>
    </div>
  );
}
