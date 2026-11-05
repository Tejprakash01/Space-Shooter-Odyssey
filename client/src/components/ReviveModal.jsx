// Revive System Modal (PDF Part VII, Section 41)
import React from 'react';
import { sound } from '../audio/audioManager.js';
import { HeartCrack, Play, RotateCcw, Home, Sparkles } from 'lucide-react';

export const ReviveModal = ({ onWatchAdRevive, onRestart, onExitHangar, revivesUsed = 0, maxRevives = 1 }) => {
  const canRevive = revivesUsed < maxRevives;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border-2 border-red-500/40 rounded-2xl p-6 text-center shadow-2xl shadow-red-950">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto mb-4 text-red-400">
          <HeartCrack className="w-8 h-8" />
        </div>

        <h2 className="font-orbitron font-black text-2xl text-red-400 tracking-wider mb-1">
          MISSION FAILED
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-rajdhani text-sm">
          Your starship was critically overwhelmed by enemy fire.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
          <p className="text-sm font-rajdhani text-slate-300 font-semibold mb-1">
            Continue from your last eligible checkpoint?
          </p>
          <div className="text-[11px] text-slate-500">
            Emergency Hull Reconstruction: 100% Shields & Hull Restored
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-1">
            Revives Used: {revivesUsed} / {maxRevives}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {canRevive ? (
            <button
              onClick={() => { sound.playClick(); onWatchAdRevive(); }}
              className="w-full py-3 px-4 rounded-xl font-orbitron font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center gap-2 shadow-neon-cyan transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Ad & Revive</span>
            </button>
          ) : (
            <div className="py-2.5 px-4 rounded-xl text-xs font-rajdhani text-amber-400 bg-amber-950/30 border border-amber-500/20">
              Maximum revives reached for this combat encounter.
            </div>
          )}

          <button
            onClick={() => { sound.playClick(); onRestart(); }}
            className="w-full py-2.5 px-4 rounded-xl font-orbitron text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Mission</span>
          </button>

          <button
            onClick={() => { sound.playClick(); onExitHangar(); }}
            className="w-full py-2.5 px-4 rounded-xl font-orbitron text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <Home className="w-3.5 h-3.5 inline mr-1" />
            Return to Hangar
          </button>
        </div>
      </div>
    </div>
  );
};

