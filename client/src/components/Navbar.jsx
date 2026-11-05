import React from 'react';
import { GAME_NAME } from '../config/gameConfig.js';
import { sound } from '../audio/audioManager.js';
import {
  Rocket, Shield, Coins, Zap, Award, BarChart3,
  Volume2, VolumeX, LogOut, User, Settings, Layers
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, profile, onLogout, onOpenAuth }) => {
  const [muted, setMuted] = React.useState(sound.settings.muted);

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
    sound.playClick();
  };

  const navItems = [
    { id: 'home', label: 'Bridge', icon: Rocket },
    { id: 'campaign', label: 'Campaign (50)', icon: Layers },
    { id: 'hangar', label: 'Fleet Hangar', icon: Shield },
    { id: 'armory', label: 'Armory', icon: Zap },
    { id: 'dashboard', label: 'Pilot Dossier', icon: User },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
    { id: 'admin', label: 'Audit & Econ', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Dynamic Title (PDF Section 4) */}
        <div
          onClick={() => { setActiveTab('home'); sound.playClick(); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-neon-cyan group-hover:scale-105 transition-transform">
            <Rocket className="w-6 h-6 text-cyan-400 transform -rotate-45" />
          </div>
          <div>
            <h1 className="font-orbitron font-extrabold text-lg md:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 drop-shadow">
              {GAME_NAME}
            </h1>
            <div className="text-[10px] text-cyan-400/70 font-mono tracking-widest uppercase">
              VELoop Rewards • Authoritative Arcade
            </div>
          </div>
        </div>

        {/* Currency & Level Ticker */}
        {profile && (
          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-rajdhani font-semibold">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Coins className="w-4 h-4" />
              <span>{profile.credits?.toLocaleString() || 0}</span>
              <span className="text-[10px] text-amber-400/60 uppercase">Credits</span>
            </div>

            <div className="h-3 w-px bg-slate-700" />

            <div className="flex items-center gap-1.5 text-purple-400">
              <Zap className="w-4 h-4" />
              <span>{profile.energyCores || 0}</span>
              <span className="text-[10px] text-purple-400/60 uppercase">Cores</span>
            </div>

            <div className="h-3 w-px bg-slate-700" />

            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-[10px] border border-cyan-500/40">
                LVL {profile.level || 1}
              </span>
              <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, ((profile.xp || 0) / ((profile.level || 1) * 250)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Nav Buttons & Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); sound.playClick(); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-orbitron transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-neon-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-slate-800"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {profile ? (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 border border-slate-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1 rounded-lg text-xs font-orbitron bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
            >
              Pilot Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

