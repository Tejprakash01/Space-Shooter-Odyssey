// Interactive Simulated Rewarded-Ad Modal (PDF Part VII, Sections 46-50)
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { sound } from '../audio/audioManager.js';
import { Play, CheckCircle2, AlertTriangle, X, ShieldAlert, Sparkles, Clock } from 'lucide-react';

export const SimulatedAdModal = ({ opportunity, onClose, onRewardGranted }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [adStarted, setAdStarted] = useState(false);

  useEffect(() => {
    sound.ensureContext();
    setAdStarted(true);
  }, []);

  useEffect(() => {
    if (!adStarted || isCompleted) return;

    if (secondsRemaining > 0) {
      const timer = setTimeout(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCompleted(true);
      handleVerification();
    }
  }, [secondsRemaining, adStarted, isCompleted]);

  const handleVerification = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const result = await api.verifyAd(opportunity.opportunityId, 'COMPLETED', 5);
      sound.playVictory();
      if (onRewardGranted) {
        onRewardGranted(result);
      }
    } catch (err) {
      setError(err.message || 'Ad verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEarlyClose = () => {
    sound.playClick();
    if (!isCompleted) {
      if (confirm('Closing this ad prematurely will forfeit your reward bonus. Are you sure?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SPONSORED TRANSMISSION
            </span>
            <span className="text-xs font-orbitron text-slate-300">
              Placement: <span className="text-cyan-400">{opportunity.placementType}</span>
            </span>
          </div>

          <button
            onClick={handleEarlyClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ad Video Simulator Screen */}
        <div className="relative h-64 bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          {/* Animated Matrix Grid Background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px]" />

          {!isCompleted ? (
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <span className="font-orbitron font-extrabold text-2xl text-cyan-300">
                  {secondsRemaining}s
                </span>
              </div>

              <div>
                <h4 className="font-orbitron font-bold text-slate-100 text-lg">
                  Galactic Sponsor Showcase
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Enjoying Space Shooter Odyssey? Complete this sponsored broadcast to claim your guaranteed reward grant.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-amber-400/80 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>Authoritative server verification pending countdown</span>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-orbitron font-bold text-white text-lg">
                Ad Presentation Complete!
              </h4>
              <p className="text-xs text-emerald-300">
                Authoritative verification token processed. Reward unlocked.
              </p>
            </div>
          )}

          {error && (
            <div className="absolute bottom-3 left-4 right-4 bg-red-950/90 border border-red-500/50 p-2 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Event ID: {opportunity.uniqueEventIdentifier.slice(0, 16)}...
          </div>

          <button
            onClick={onClose}
            disabled={!isCompleted || isVerifying}
            className={`px-5 py-2 rounded-lg font-orbitron text-xs font-bold transition-all ${
              isCompleted && !isVerifying
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-neon-cyan'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isVerifying ? 'Verifying...' : isCompleted ? 'Claim & Resume' : `Wait ${secondsRemaining}s`}
          </button>
        </div>
      </div>
    </div>
  );
};

