// Administration & Economy Analytics Dashboard (PDF Part XIII, Sections 74-77)
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { sound } from '../audio/audioManager.js';
import {
  BarChart3, ShieldAlert, Coins, RefreshCw,
  TrendingUp, CheckCircle, AlertTriangle, Settings, Eye
} from 'lucide-react';

export const AdminScreen = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states for live economy adjustments (PDF Section 35)
  const [missionCredits, setMissionCredits] = useState(100);
  const [bossCredits, setBossCredits] = useState(250);
  const [maxAdsPerDay, setMaxAdsPerDay] = useState(10);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminMetrics();
      setMetrics(res.metrics);
      if (res.metrics?.activeEconomyConfig) {
        setMissionCredits(res.metrics.activeEconomyConfig.missionCompletionCredits);
        setBossCredits(res.metrics.activeEconomyConfig.bossCompletionCredits);
        setMaxAdsPerDay(res.metrics.activeEconomyConfig.rewardedAds?.maxRewardedAdsPerDay || 10);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    sound.playClick();
    setUpdating(true);
    setSuccessMsg(null);
    try {
      await api.request('/admin/config', {
        method: 'POST',
        body: JSON.stringify({
          missionCompletionCredits: Number(missionCredits),
          bossCompletionCredits: Number(bossCredits),
          rewardedAds: {
            ...metrics.activeEconomyConfig.rewardedAds,
            maxRewardedAdsPerDay: Number(maxAdsPerDay)
          }
        })
      });
      sound.playPowerUp();
      setSuccessMsg('Server-authoritative economy configuration updated live.');
      await loadMetrics();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !metrics) {
    return <div className="text-center p-12 font-orbitron text-cyan-400">Loading Administrative Telemetry...</div>;
  }

  const statCards = [
    { label: 'Total Ad Opportunities', val: metrics.totalAdOpportunities, color: 'text-cyan-400' },
    { label: 'Completed Rewarded Ads', val: metrics.completedRewardedAds, color: 'text-emerald-400' },
    { label: 'Rewarded-Ad Completion Rate', val: metrics.rewardedAdCompletionRate, color: 'text-purple-400' },
    { label: 'Fraud / Rejections Prevented', val: metrics.rewardsRejected, color: 'text-red-400' },
    { label: 'Credits Distributed', val: metrics.creditsGranted?.toLocaleString(), color: 'text-amber-400' },
    { label: 'Credits Sunk / Spent', val: metrics.creditsSpent?.toLocaleString(), color: 'text-sky-400' },
    { label: 'Revive Ad Conversion', val: metrics.reviveConversion, color: 'text-cyan-400' },
    { label: 'Double Score Conversion', val: metrics.doubleScoreConversion, color: 'text-purple-400' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Banner */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-orbitron font-extrabold text-2xl text-white">
              VELoop Rewards Economy Telemetry & Audit
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
              RESTRICTED
            </span>
          </div>
          <p className="text-xs text-slate-400 font-rajdhani mt-1">
            Authoritative platform metrics derived from immutable transactional ledgers (PDF Part XIII, Sections 74-77)
          </p>
        </div>

        <button
          onClick={loadMetrics}
          className="px-4 py-2 rounded-xl text-xs font-orbitron bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((st, i) => (
          <div key={i} className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="text-[11px] text-slate-400 font-rajdhani uppercase">{st.label}</div>
            <div className={`font-orbitron font-black text-xl md:text-2xl mt-1 ${st.color}`}>
              {st.val}
            </div>
          </div>
        ))}
      </div>

      {/* Live Economy Config Adjustments (PDF Section 35) */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div>
          <h3 className="font-orbitron font-bold text-base text-white">
            Server-Controlled Economy Live Tuning
          </h3>
          <p className="text-xs text-slate-400 font-rajdhani">
            Adjust balance parameters live without requiring client rebuilds. Changes propagate instantly to all game sessions.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-orbitron text-slate-300 mb-1">
              Mission Base Credits
            </label>
            <input
              type="number"
              value={missionCredits}
              onChange={(e) => setMissionCredits(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-orbitron text-slate-300 mb-1">
              Boss Defeat Bounty Credits
            </label>
            <input
              type="number"
              value={bossCredits}
              onChange={(e) => setBossCredits(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-orbitron text-slate-300 mb-1">
              Max Rewarded Ads Per Day
            </label>
            <input
              type="number"
              value={maxAdsPerDay}
              onChange={(e) => setMaxAdsPerDay(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 rounded-xl font-orbitron text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-neon-cyan transition"
            >
              {updating ? 'Transmitting Updates...' : 'APPLY AUTHORITATIVE OVERRIDES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

