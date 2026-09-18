// src/components/admin/RecommendedResourceBlueprintEditor.jsx
// Production-Ready 1:1 Blueprint Experience for Recommended Resources
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Smartphone,
  Monitor,
  Eye,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Link as LinkIcon,
  Tag,
  FolderPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

import ImageProcessorStudio from '@/components/admin/ImageProcessorStudio';
import AdminAuth from '@/components/admin/AdminAuth';
import Toast from '@/components/Toast';
import { CATEGORIES } from '@/lib/seedData';
import {
  addRecommendedResource,
  updateRecommendedResource,
  fetchRecommendedResources,
  COLLECTIONS,
  db
} from '@/lib/firestoreStore';
import { doc, getDoc } from 'firebase/firestore';

// Default initial state
const defaultResourceState = {
  headline: '',
  tagline: '',
  description: '',
  category: 'Tools & Software',
  heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  carouselImages: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'],
  readMore: '',
  active: true,
  links: [
    {
      label: 'Official Website',
      url: 'https://example.com',
      description: 'Visit the platform to explore free features and student discounts.'
    }
  ],
};

export default function RecommendedResourceBlueprintEditor({ mode = 'create', id = null }) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  // Form State
  const [form, setForm] = useState(defaultResourceState);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Dynamic Categories State
  const [availableCategories, setAvailableCategories] = useState(() => {
    const list = CATEGORIES.filter((c) => c !== 'All');
    if (!list.includes('Tools & Software')) list.unshift('Tools & Software');
    if (!list.includes('Coaching & Mentorship')) list.push('Coaching & Mentorship');
    if (!list.includes('YouTube & Learning')) list.push('YouTube & Learning');
    return list;
  });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Preview Mode: 'mobile' | 'desktop'
  const [previewMode, setPreviewMode] = useState('mobile');

  // Load existing data if in Edit Mode
  useEffect(() => {
    if (!isEdit || !id) return;

    const loadResource = async () => {
      setLoadingInitial(true);
      try {
        let data = null;
        if (db) {
          const docSnap = await getDoc(doc(db, COLLECTIONS.RECOMMENDED_RESOURCES, id));
          if (docSnap.exists()) {
            data = { id: docSnap.id, ...docSnap.data() };
          }
        }
        if (!data) {
          const all = await fetchRecommendedResources();
          data = all.find((r) => r.id === id);
        }

        if (data) {
          setForm({
            headline: data.headline || '',
            tagline: data.tagline || '',
            description: data.description || '',
            category: data.category || 'Tools & Software',
            heroImage: data.heroImage || '',
            carouselImages: data.carouselImages || (data.heroImage ? [data.heroImage] : []),
            readMore: data.readMore || '',
            active: data.active ?? true,
            links: data.links || [],
          });

          // Ensure category is present in available categories
          if (data.category) {
            setAvailableCategories((prev) => (prev.includes(data.category) ? prev : [...prev, data.category]));
          }
        } else {
          setToastMessage('Resource not found in database.');
        }
      } catch (err) {
        console.error('Failed to load resource for edit:', err);
        setToastMessage('Failed to load resource data.');
      } finally {
        setLoadingInitial(false);
      }
    };

    loadResource();
  }, [isEdit, id]);

  // Handle Dynamic Category Creation
  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!availableCategories.includes(trimmed)) {
      setAvailableCategories((prev) => [...prev, trimmed]);
    }
    setForm((prev) => ({ ...prev, category: trimmed }));
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  // Links Handlers
  const handleAddLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        { label: '', url: '', description: '' }
      ]
    }));
  };

  const handleUpdateLink = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.links];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, links: updated };
    });
  };

  const handleRemoveLink = (index) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  // Submit handler
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!form.headline.trim()) {
      setToastMessage('Please enter a headline for this resource.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        headline: form.headline.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        category: form.category || 'Tools & Software',
        heroImage: form.heroImage || '',
        carouselImages: form.carouselImages?.length ? form.carouselImages : (form.heroImage ? [form.heroImage] : []),
        readMore: form.readMore.trim(),
        links: form.links || [],
        active: Boolean(form.active),
      };

      let result;
      if (isEdit && id) {
        result = await updateRecommendedResource(id, payload);
      } else {
        result = await addRecommendedResource(payload);
      }

      if (result.success) {
        // Trigger background push notification for newly published active resource (non-blocking)
        if (!isEdit && payload.active) {
          fetch('/api/admin/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `🛠️ New Recommended Resource: ${payload.title}`,
              message: payload.description || `Explore ${payload.title} to power your student micro-startup.`,
              url: payload.affiliateUrl || '/',
              type: 'resource',
              adminEmail: 'kondeboyinaprabhas@gmail.com',
            }),
          }).catch((e) => console.warn('[Push Hook] Failed to send resource push:', e));
        }

        setToastMessage(isEdit ? 'Resource updated successfully!' : 'Resource published successfully!');
        setTimeout(() => {
          router.push('/admin/recommended-resources');
        }, 1200);
      } else {
        setToastMessage('Error saving resource: ' + result.error);
        setIsSaving(false);
      }
    } catch (err) {
      console.error('Error saving resource:', err);
      setToastMessage('Unexpected error occurred while saving.');
      setIsSaving(false);
    }
  };

  return (
    <AdminAuth>
      <div className="min-h-screen bg-slate-950 text-white pb-24">
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}

        {/* Top Sticky Header */}
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left Back and Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin/recommended-resources"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
                title="Back to Resources List"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-white tracking-tight">
                    {isEdit ? 'Edit Recommended Resource' : 'New Recommended Resource'}
                  </h1>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    form.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {form.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isEdit ? `Editing ID: ${id}` : 'Create a new resource to recommend in the discovery feed'}
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Active Toggle in Header */}
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold cursor-pointer hover:bg-slate-800 transition-colors"
              >
                {form.active ? (
                  <>
                    <ToggleLeft className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Visible</span>
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400">Hidden</span>
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <Link
                href="/admin/recommended-resources"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
              >
                Cancel
              </Link>

              {/* Primary Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-950/40 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEdit ? 'Save Changes' : 'Publish Resource'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto p-6">
          {loadingInitial ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading resource data from Firestore...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
              {/* Left Column: Editor & Tooling (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Image Processor Studio */}
                <ImageProcessorStudio
                  heroImage={form.heroImage}
                  carouselImages={form.carouselImages}
                  onUpdateImages={({ heroImage, carouselImages }) => {
                    setForm((prev) => ({ ...prev, heroImage, carouselImages }));
                  }}
                />

                {/* 3. Core Resource Details Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-teal-400" />
                      <span>Resource Details & Messaging</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Essential details for discovery</span>
                  </div>

                  {/* Headline & Tagline */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Headline / Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.headline}
                        onChange={(e) => setForm({ ...form, headline: e.target.value })}
                        placeholder="e.g. Canva Pro for Students & Independent Creators"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={form.tagline}
                        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        placeholder="e.g. Design high converting templates and pitch decks with free student tools"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Dynamic Category Selector */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-300">
                        Category *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>{showAddCategory ? 'Cancel' : '+ New Category'}</span>
                      </button>
                    </div>

                    {showAddCategory ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Type new category name..."
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-teal-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-teal-500 cursor-pointer"
                      >
                        {availableCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Description / Overview *
                    </label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Comprehensive overview of why this resource helps students earn or build faster..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500 leading-relaxed"
                    />
                  </div>

                  {/* Read More Section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Read More / Extended Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={form.readMore}
                      onChange={(e) => setForm({ ...form, readMore: e.target.value })}
                      placeholder="Action steps, discounts, coupon codes, or onboarding tips..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500 leading-relaxed"
                    />
                  </div>

                  {/* Active Visibility Card */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Feed Visibility</span>
                      <p className="text-[11px] text-slate-400">
                        When enabled, this resource is eligible to be injected into the user feed.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {form.active ? (
                        <>
                          <ToggleLeft className="w-6 h-6 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-6 h-6 text-slate-500" />
                          <span className="text-xs font-bold text-slate-500">Disabled</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 4. Action Links Manager Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-teal-400" />
                      <h3 className="text-base font-bold text-white">
                        Action Links & Resources ({form.links.length})
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="flex items-center gap-1.5 text-xs font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Link</span>
                    </button>
                  </div>

                  {form.links.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No action links added yet. Click &quot;Add Link&quot; above to provide direct access URLs.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.links.map((link, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2 relative group hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-teal-400">
                              Link #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(idx)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Delete link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                                Button Label *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Visit Website / Free Tier"
                                value={link.label}
                                onChange={(e) => handleUpdateLink(idx, 'label', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-teal-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                                Destination URL *
                              </label>
                              <input
                                type="url"
                                placeholder="https://..."
                                value={link.url}
                                onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-teal-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">
                              Description / Offer Details (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Free 30-day trial for students"
                              value={link.description}
                              onChange={(e) => handleUpdateLink(idx, 'description', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-teal-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-3 sticky bottom-4 shadow-2xl z-30">
                  <Link
                    href="/admin/recommended-resources"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-900/40 active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{isEdit ? 'Save Changes' : 'Publish Resource'}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Right Column: Live Previews (Mobile Smartphone + Desktop) (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Preview Mode Switcher */}
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-2">
                  <span className="text-xs font-bold text-slate-300 ml-2 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-teal-400" />
                    <span>Live Preview</span>
                  </span>

                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('mobile')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewMode === 'mobile'
                          ? 'bg-teal-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewMode('desktop')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewMode === 'desktop'
                          ? 'bg-teal-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop</span>
                    </button>
                  </div>
                </div>

                {/* MOBILE PREVIEW: Authentic Smartphone Mockup Frame */}
                {previewMode === 'mobile' ? (
                  <div className="sticky top-24 flex flex-col items-center">
                    <div className="w-[360px] h-[720px] bg-slate-950 border-[7px] border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-slate-700/50">
                      
                      {/* Dynamic Island / Camera Notch */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-slate-950 mr-2 border border-slate-800" />
                        <div className="w-8 h-1 bg-slate-800 rounded-full" />
                      </div>

                      {/* Phone Screen Status Bar */}
                      <div className="pt-2 px-6 pb-2 flex items-center justify-between text-[11px] text-slate-400 z-20 border-b border-slate-800/40 bg-slate-950/80 backdrop-blur-sm">
                        <span className="font-semibold text-white">9:41</span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span>5G</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Scrollable Feed Screen */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
                        {/* Feed Badge Header */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                          <span className="font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Recommended Resource
                          </span>
                          <span className="bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                            Feed Injected
                          </span>
                        </div>

                        {/* Resource Mobile Card Mockup */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-3 pb-4">
                          {/* Hero Image */}
                          <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                            {form.heroImage ? (
                              <img
                                src={form.heroImage}
                                alt="Resource Hero"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                                No Hero Image
                              </div>
                            )}

                            {/* Category Badge on Image */}
                            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-teal-500/30 text-teal-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                              {form.category || 'Tools & Software'}
                            </div>

                            {form.active && (
                              <div className="absolute top-3 right-3 bg-emerald-500/90 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified</span>
                              </div>
                            )}
                          </div>

                          {/* Carousel strip */}
                          {form.carouselImages?.length > 1 && (
                            <div className="flex gap-1.5 px-4 overflow-x-auto pb-1">
                              {form.carouselImages.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt="thumb"
                                  className="w-12 h-8 rounded-lg object-cover border border-slate-700/60 shrink-0"
                                />
                              ))}
                            </div>
                          )}

                          {/* Text Body */}
                          <div className="px-4 space-y-2">
                            <h4 className="text-sm font-bold text-white leading-snug">
                              {form.headline || 'Your Headline Will Appear Here'}
                            </h4>

                            {form.tagline && (
                              <p className="text-xs text-teal-300 font-medium">
                                {form.tagline}
                              </p>
                            )}

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {form.description || 'Description summary and features will appear here in the user feed.'}
                            </p>

                            {form.readMore && (
                              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
                                <span className="font-bold text-slate-300 block">More Information:</span>
                                <p className="leading-normal">{form.readMore}</p>
                              </div>
                            )}
                          </div>

                          {/* Action Links Buttons */}
                          {form.links?.length > 0 && (
                            <div className="px-4 pt-2 space-y-2">
                              {form.links.map((lnk, idx) => (
                                <a
                                  key={idx}
                                  href={lnk.url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.preventDefault()}
                                  className="w-full flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl text-xs font-semibold text-white transition-all shadow-sm"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-teal-400 font-bold">{lnk.label || 'Visit Link'}</span>
                                      <ExternalLink className="w-3 h-3 text-slate-400" />
                                    </div>
                                    {lnk.description && (
                                      <span className="text-[10px] text-slate-400 block line-clamp-1">
                                        {lnk.description}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">
                                    Open
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Smartphone Home Bar Indicator */}
                      <div className="py-2 flex justify-center bg-slate-950 border-t border-slate-800/50">
                        <div className="w-32 h-1 bg-slate-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* DESKTOP PREVIEW: Wide Card Representation */
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5" /> Desktop Feed Card View
                      </span>
                      <span className="text-[11px] bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-300">
                        1280px Screen
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden">
                      <div className="relative aspect-video w-full bg-slate-900">
                        {form.heroImage ? (
                          <img
                            src={form.heroImage}
                            alt="Desktop Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                            No Hero Image Selected
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-teal-500/30 text-teal-300 text-xs font-bold px-3 py-1 rounded-full">
                          {form.category || 'Tools & Software'}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          {form.headline || 'Resource Headline'}
                        </h2>

                        {form.tagline && (
                          <p className="text-xs text-teal-300 font-medium">
                            {form.tagline}
                          </p>
                        )}

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {form.description || 'Description will render in the desktop feed card view.'}
                        </p>

                        {form.readMore && (
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 space-y-1">
                            <span className="font-bold text-slate-200">Extended Details:</span>
                            <p>{form.readMore}</p>
                          </div>
                        )}

                        {form.links?.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {form.links.map((lnk, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-xs font-bold text-white block">
                                    {lnk.label || 'Link'}
                                  </span>
                                  {lnk.description && (
                                    <span className="text-[10px] text-slate-400">
                                      {lnk.description}
                                    </span>
                                  )}
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </main>
      </div>
    </AdminAuth>
  );
}
