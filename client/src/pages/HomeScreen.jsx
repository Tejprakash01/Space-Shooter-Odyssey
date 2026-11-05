// Game Home Screen (PDF Part XII, Section 69)
import React from 'react';
import { GAME_NAME, REWARD_PLATFORM } from '../config/gameConfig.js';
import { sound } from '../audio/audioManager.js';
import {
  Play, Rocket, Shield, Award, Calendar, Zap,
  Sparkles, ChevronRight, Gift, BarChart2, Radio
} from 'lucide-react';

export const HomeScreen = ({
  profile,
  onStartCampaign,
  onOpenHangar,
  onOpenArmory,
  onOpenDashboard,
  onOpenLeaderboard,
  onClaimSupplyDrop
}) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between p-4 md:p-8 max-w-7xl mx-auto">
      {/* Hero Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>COMMAND TRANSMISSION ONLINE • {REWARD_PLATFORM} INTEGRATED</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-orbitron font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-wider leading-tight">
              {GAME_NAME.split(' ')[0]} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
                {GAME_NAME.split(' ').slice(1).join(' ') || 'ODYSSEY'}
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 font-rajdhani max-w-xl font-medium leading-relaxed">
              Engage hostile dreadnought fleets across 5 deep-space sectors. Upgrade your starship chassis, master 8 tactical combat abilities, and earn authoritative rewards.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => { sound.playClick(); onStartCampaign(); }}
              className="px-8 py-4 rounded-xl font-orbitron font-black text-sm bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-neon-cyan transform hover:-translate-y-0.5 transition-all flex items-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>LAUNCH CAMPAIGN</span>
            </button>

            <button
              onClick={() => { sound.playClick(); onOpenHangar(); }}
              className="px-6 py-4 rounded-xl font-orbitron text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/50 transition flex items-center gap-2.5"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>FLEET HANGAR</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          {profile && (
            <div className="grid grid-cols-3 gap-3 max-w-md pt-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Missions Cleared</div>
                <div className="font-orbitron font-bold text-lg text-cyan-400">
                  {profile.completedMissions?.length || 0} / 50
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Active Vessel</div>
                <div className="font-orbitron font-bold text-sm text-purple-400 truncate">
                  {profile.selectedShipId?.toUpperCase() || 'INTERCEPTOR'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Daily Streak</div>
                <div className="font-orbitron font-bold text-lg text-amber-400">
                  {profile.dailyStreak?.current || 1} Days
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Sci-Fi Starship Hologram Canvas Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-b from-cyan-950/40 via-slate-900/70 to-slate-950 border-2 border-cyan-500/30 p-6 flex flex-col items-center justify-between shadow-2xl shadow-cyan-500/10">
            {/* Holographic Concentric Target Rings */}
            <div className="absolute inset-8 rounded-full border border-cyan-500/20 border-dashed animate-[spin_30s_linear_infinite]" />
            <div className="absolute inset-16 rounded-full border border-purple-500/20" />

            <div className="w-full flex items-center justify-between z-10">
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30">
                STATUS: READY FOR DEPLOYMENT
              </span>
              <span className="text-xs font-mono text-slate-400">SYS.VER.1.0</span>
            </div>

            {/* Starship Visual Graphic */}
            <div className="relative z-10 my-auto flex flex-col items-center group cursor-pointer" onClick={onOpenHangar}>
              <div className="w-32 h-32 relative flex items-center justify-center animate-pulse">
                <Rocket className="w-28 h-28 text-cyan-400 transform -rotate-45 drop-shadow-[0_0_20px_rgba(0,240,255,0.7)]" />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-orbitron font-bold text-base text-white">
                  {profile?.selectedShipId?.toUpperCase() || 'AERO INTERCEPTOR'}
                </h4>
                <p className="text-xs text-cyan-300 font-rajdhani">Class: Frontline Combat Interceptor</p>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="w-full z-10 flex gap-2">
              <button
                onClick={() => { sound.playClick(); onClaimSupplyDrop(); }}
                className="flex-1 py-2 rounded-xl text-xs font-orbitron bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-1.5 transition"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Supply Drop</span>
              </button>

              <button
                onClick={() => { sound.playClick(); onOpenArmory(); }}
                className="flex-1 py-2 rounded-xl text-xs font-orbitron bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center justify-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Armory (8)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Feature Banners */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-900">
        <div
          onClick={() => { sound.playClick(); onStartCampaign(); }}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-orbitron font-bold text-white">50 Playable Missions</div>
            <div className="text-[11px] text-slate-400 font-rajdhani">5 Distinct sectors with 5 unique bosses</div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </div>

        <div
          onClick={() => { sound.playClick(); onOpenHangar(); }}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-orbitron font-bold text-white">5 Starship Classes</div>
            <div className="text-[11px] text-slate-400 font-rajdhani">Multi-level weapon & shield upgrades</div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </div>

        <div
          onClick={() => { sound.playClick(); onOpenDashboard(); }}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-orbitron font-bold text-white">Daily Login Streaks</div>
            <div className="text-[11px] text-slate-400 font-rajdhani">7-day reward calendar & daily missions</div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </div>

        <div
          onClick={() => { sound.playClick(); onOpenLeaderboard(); }}
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-orbitron font-bold text-white">Galactic Leaderboard</div>
            <div className="text-[11px] text-slate-400 font-rajdhani">Global scores with anti-cheat verification</div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </div>
      </div>
    </div>
  );
};

