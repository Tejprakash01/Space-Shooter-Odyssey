// Armory & Tactical Combat Power-Ups (PDF Part V & VII, Sections 26-28, 44)
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { sound } from '../audio/audioManager.js';
import {
  Shield, Zap, Split, Crosshair, Radio, HeartPulse,
  Flame, Compass, Play, Plus, Coins, CheckCircle2
} from 'lucide-react';

export const ArmoryScreen = ({ profile, onProfileUpdate, onWatchAdForPowerUp }) => {
  const [powerups, setPowerups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);
  const [error, setError] = useState(null);

  const iconMap = {
    shield_pulse: Shield,
    rapid_fire: Zap,
    spread_shot: Split,
    homing_missiles: Crosshair,
    emp_blast: Radio,
    repair_drone: HeartPulse,
    overdrive: Flame,
    emergency_warp: Compass
  };

  useEffect(() => {
    loadPowerUps();
  }, [profile]);

  const loadPowerUps = async () => {
    try {
      const res = await api.getPowerUps();
      setPowerups(res.powerups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (powerUpId) => {
    sound.playClick();
    setError(null);
    setPurchasingId(powerUpId);
    try {
      await api.acquirePowerUp(powerUpId, 1);
      sound.playPowerUp();
      await loadPowerUps();
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setPurchasingId(null);
    }
  };

  if (loading) {
    return <div className="text-center p-12 font-orbitron text-cyan-400">Loading Armory...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
            Tactical Sub-System Requisition
          </span>
          <h2 className="font-orbitron font-extrabold text-2xl text-white mt-1">
            Combat Modules & Power-Ups
          </h2>
          <p className="text-xs text-slate-300 font-rajdhani max-w-xl mt-1">
            Equip up to 8 specialized battlefield abilities. Items in your armory can be triggered in real-time combat via keyboard hotkeys or HUD controls.
          </p>
        </div>

        {/* Rewarded Ad Promotion for Free Defensive Module (PDF Section 44) */}
        <button
          onClick={() => { sound.playClick(); onWatchAdForPowerUp(); }}
          className="px-5 py-3 rounded-2xl font-orbitron text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-neon-gold transition flex items-center gap-3"
        >
          <Play className="w-4 h-4 fill-amber-400" />
          <div className="text-left">
            <div className="text-[10px] text-amber-400/80 font-mono uppercase">Rewarded Opportunity</div>
            <div>WATCH AD → FREE SHIELD PULSE</div>
          </div>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* 8 Mandatory Power-Ups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {powerups.map(p => {
          const Icon = iconMap[p.id] || Shield;
          const count = profile?.powerUpInventory?.[p.id] || 0;

          return (
            <div
              key={p.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 flex flex-col justify-between hover:border-cyan-500/40 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-orbitron font-bold text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Owned: {count}
                  </span>
                </div>

                <h4 className="font-orbitron font-bold text-sm text-white mb-1">
                  {p.name}
                </h4>
                <p className="text-xs text-slate-400 font-rajdhani line-clamp-3 mb-4 leading-relaxed">
                  {p.description}
                </p>

                <div className="space-y-1 mb-4 text-[11px] font-mono text-slate-500 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-slate-300">{p.duration > 0 ? `${p.duration}s` : 'Instant Salvo'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cooldown:</span>
                    <span className="text-slate-300">{p.cooldown}s</span>
                  </div>
                </div>
              </div>

              <button
                disabled={purchasingId === p.id}
                onClick={() => handleBuy(p.id)}
                className="w-full py-2.5 rounded-xl font-orbitron text-xs font-bold bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 transition flex items-center justify-center gap-2"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>REQUISITION ({p.currencyCost} CREDITS)</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

