// MaintenanceControl.jsx - Production Maintenance Mode Control
'use client';

import { useState, useEffect } from 'react';
import { Power, CheckCircle2 } from 'lucide-react';
import { getMaintenanceConfig, setMaintenanceConfig } from '@/lib/ideasStore';

export default function MaintenanceControl() {
  const [config, setConfig] = useState({
    enabled: false,
    scheduledLaunch: '',
    message: 'We are updating student earning blueprints. Launching soon!'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = getMaintenanceConfig();
      setConfig({
        enabled: !!current.enabled,
        scheduledLaunch: current.scheduledLaunch || '',
        message: current.message || 'We are updating student earning blueprints. Launching soon!'
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    setMaintenanceConfig({
      enabled: config.enabled,
      scheduledLaunch: config.scheduledLaunch || '',
      message: config.message
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Power className={`w-5 h-5 ${config.enabled ? 'text-rose-400' : 'text-emerald-400'}`} />
          <div>
            <h4 className="text-sm font-bold text-white">Production Maintenance Mode</h4>
            <p className="text-[11px] text-slate-400">Control public site availability and maintenance notice</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
          className={`font-bold text-xs px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
            config.enabled
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
          }`}
        >
          {config.enabled ? '● Maintenance ON' : '○ Site Live (Maintenance OFF)'}
        </button>
      </div>

      <div className="text-xs space-y-2">
        <label className="block text-slate-400 font-bold">Maintenance Banner Message:</label>
        <input
          type="text"
          value={config.message}
          onChange={e => setConfig({ ...config, message: e.target.value })}
          placeholder="e.g. We are polishing new 2026 student earning blueprints. Launching soon!"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 outline-none focus:border-teal-500"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-500">
          When active, public visitors see the maintenance notice. Authorized admins can access the studio via Google Sign-In.
        </span>
        <button
          type="button"
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 text-white" /> : null}
          <span>{saved ? 'Saved!' : 'Apply Settings'}</span>
        </button>
      </div>
    </div>
  );
}
