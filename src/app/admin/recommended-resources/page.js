// src/app/admin/recommended-resources/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import {
  fetchRecommendedResources,
  updateRecommendedResource,
  deleteRecommendedResource,
} from "@/lib/firestoreStore";
import AdminAuth from "@/components/admin/AdminAuth";

export default function RecommendedResourcesPage() {
  // ---------- State ----------
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Global Display Frequency
  const [globalFrequency, setGlobalFrequency] = useState(7);

  // ---------- Load ----------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchRecommendedResources();
      setResources(data);
      setLoading(false);
    };

    load();
  }, []);

  // ---------- Delete ----------
  const handleDelete = async (id) => {
    if (!confirm("Delete this resource permanently?")) return;

    const res = await deleteRecommendedResource(id);

    if (res.success) {
      setResources((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Delete failed: " + res.error);
    }
  };

  // ---------- Active Toggle ----------
  const toggleActive = async (resource) => {
    await updateRecommendedResource(resource.id, {
      active: !resource.active,
    });

    setResources((prev) =>
      prev.map((r) =>
        r.id === resource.id ? { ...r, active: !r.active } : r
      )
    );
  };

  // ---------- Render ----------
  return (
    <AdminAuth>
      <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
        {/* Top Breadcrumb navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Studio</span>
          </Link>

          <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{resources.length} Total Resources</span>
          </span>
        </div>

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Recommended Resources
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Curated coaching, software tools, educational content, and student opportunities.
              </p>
            </div>

            <Link
              href="/admin/recommended-resources/new"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold px-5 py-3 rounded-2xl shadow-lg shadow-teal-900/30 transition-all active:scale-95 cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Resource
            </Link>
          </div>

          {/* Global Display Frequency Card */}
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold text-sm">
                Global Display Frequency
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Insert one Recommended Resource in the feed after every {globalFrequency} ideas.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <input
                type="number"
                min={1}
                value={globalFrequency}
                onChange={(e) =>
                  setGlobalFrequency(Number(e.target.value) || 1)
                }
                className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-semibold outline-none focus:border-teal-500 text-sm"
              />
              <span className="text-slate-300 font-medium text-xs">Ideas</span>
            </div>
          </div>
        </div>

        {/* Resource Table */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">
            Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <p className="text-slate-400 text-sm">No recommended resources found.</p>
            <Link
              href="/admin/recommended-resources/new"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              Create First Resource
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700/60 text-xs font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Hero</th>
                    <th className="px-5 py-3.5">Headline & Tagline</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {resources.map((res) => (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        {res.heroImage ? (
                          <img
                            src={res.heroImage}
                            alt={res.headline || "resource"}
                            className="w-16 h-10 object-cover rounded-lg border border-slate-700/60"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-500">
                            No img
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-200">
                          {res.headline || "Untitled Resource"}
                        </div>
                        {res.tagline && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {res.tagline}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-1 rounded-full text-[11px] font-medium">
                          {res.category || "General"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggleActive(res)}
                          className="flex items-center gap-1.5 cursor-pointer"
                          title={res.active ? "Click to disable" : "Click to enable"}
                        >
                          {res.active ? (
                            <>
                              <ToggleLeft className="w-5 h-5 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold text-[11px]">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-5 h-5 text-slate-500" />
                              <span className="text-slate-500 font-semibold text-[11px]">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <Link
                          href={`/admin/recommended-resources/${res.id}/edit`}
                          className="inline-flex items-center p-2 bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-300 rounded-xl transition-colors"
                          title="Edit Resource"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(res.id)}
                          className="inline-flex items-center p-2 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 rounded-xl transition-colors cursor-pointer"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminAuth>
  );
}