// Combat Screen & Canvas Engine Mount (PDF Part II & V)
import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../game/GameEngine.js';
import { api } from '../services/api.js';
import { sound } from '../audio/audioManager.js';
import { ReviveModal } from '../components/ReviveModal.jsx';
import { MissionResultModal } from '../components/MissionResultModal.jsx';
import { SimulatedAdModal } from '../components/SimulatedAdModal.jsx';
import {
  Pause, Play, Shield, Zap, Crosshair, Radio,
  HeartPulse, Flame, Compass, RotateCcw, Home
} from 'lucide-react';

export const CombatScreen = ({
  mission,
  ship,
  profile,
  onExitCombat,
  onProfileUpdate
}) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hudStats, setHudStats] = useState({
    health: 100, maxHealth: 100, shield: 50, maxShield: 50, score: 0, wave: 1, totalWaves: 3
  });

  // Modal States
  const [showReviveModal, setShowReviveModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [activeAdOpportunity, setActiveAdOpportunity] = useState(null);
  const [completionTelemetry, setCompletionTelemetry] = useState(null);
  const [completionResult, setCompletionResult] = useState(null);

  const powerUpIcons = {
    shield_pulse: Shield,
    rapid_fire: Zap,
    spread_shot: Crosshair,
    homing_missiles: Crosshair,
    emp_blast: Radio,
    repair_drone: HeartPulse,
    overdrive: Flame,
    emergency_warp: Compass
  };

  useEffect(() => {
    initSession();
    return () => {
      if (engineRef.current) engineRef.current.destroy();
    };
  }, []);

  const initSession = async () => {
    try {
      // 1. Authoritative Session Initialization (PDF Section 20 & 64)
      const res = await api.startGame(mission.id, ship.id);
      setSession(res.session);

      // 2. Fetch full mission & boss data
      const missionDetail = await api.getMission(mission.id);

      // 3. Mount Canvas Engine
      const canvas = canvasRef.current;
      if (!canvas) return;

      const engine = new GameEngine(canvas, {
        shipData: ship,
        missionData: missionDetail.mission,
        bossData: missionDetail.boss,
        callbacks: {
          onPauseState: (paused) => setIsPaused(paused),
          onWaveUpdate: (w) => setHudStats(prev => ({ ...prev, wave: w.currentWave, totalWaves: w.totalWaves })),
          onDefeat: (telemetry) => handleDefeat(res.session.sessionId, telemetry),
          onVictory: (telemetry) => handleVictory(res.session.sessionId, telemetry)
        }
      });

      engineRef.current = engine;
      engine.start();

      // Start sound ambient background music
      sound.startMusic();
    } catch (err) {
      alert(`Combat launch aborted: ${err.message}`);
      onExitCombat();
    } finally {
      setSessionLoading(false);
    }
  };

  // Telemetry HUD synchronization loop
  useEffect(() => {
    const timer = setInterval(() => {
      const eng = engineRef.current;
      if (eng && eng.player) {
        setHudStats(prev => ({
          ...prev,
          health: Math.max(0, Math.round(eng.player.health)),
          maxHealth: eng.player.maxHealth,
          shield: Math.max(0, Math.round(eng.player.shield)),
          maxShield: eng.player.maxShield,
          score: eng.score
        }));
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleDefeat = async (sessionId, telemetry) => {
    setCompletionTelemetry(telemetry);
    try {
      const res = await api.completeGame(sessionId, telemetry);
      setCompletionResult(res);
      setShowReviveModal(true);
    } catch (err) {
      console.error(err);
      setShowReviveModal(true);
    }
  };

  const handleVictory = async (sessionId, telemetry) => {
    setCompletionTelemetry(telemetry);
    try {
      const res = await api.completeGame(sessionId, telemetry);
      setCompletionResult(res);
      setShowResultModal(true);
    } catch (err) {
      console.error(err);
      setShowResultModal(true);
    }
  };

  // Revive Flow (PDF Part VII, Section 41)
  const handleWatchAdRevive = async () => {
    try {
      const oppRes = await api.createAdOpportunity('REVIVE', session.sessionId, mission.id);
      setActiveAdOpportunity(oppRes.opportunity);
    } catch (err) {
      alert(err.message);
    }
  };

  const onAdRewardVerified = (grantResult) => {
    setActiveAdOpportunity(null);
    if (showReviveModal) {
      setShowReviveModal(false);
      if (engineRef.current) {
        engineRef.current.revivePlayer();
        engineRef.current.start();
      }
    }
  };

  // Double Score Flow (PDF Section 42)
  const handleWatchAdDoubleScore = async (onSuccess) => {
    try {
      const oppRes = await api.createAdOpportunity('DOUBLE_SCORE', session.sessionId, mission.id);
      setActiveAdOpportunity({
        ...oppRes.opportunity,
        customCallback: onSuccess
      });
    } catch (err) {
      alert(err.message);
    }
  };

  // Double Credits Flow (PDF Section 43)
  const handleWatchAdDoubleCredits = async (onSuccess) => {
    try {
      const oppRes = await api.createAdOpportunity('DOUBLE_CREDITS', session.sessionId, mission.id);
      setActiveAdOpportunity({
        ...oppRes.opportunity,
        customCallback: onSuccess
      });
    } catch (err) {
      alert(err.message);
    }
  };

  // Claim & Finalize
  const handleClaimFinalRewards = async () => {
    if (!session) return;
    try {
      await api.claimRewards(session.sessionId);
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      alert(err.message);
    }
  };

  // In-Combat Power-Up Trigger
  const handleUsePowerUp = async (powerUpId) => {
    sound.playClick();
    if (!engineRef.current) return;
    const inventoryCount = profile?.powerUpInventory?.[powerUpId] || 0;
    if (inventoryCount <= 0) {
      return;
    }

    try {
      await api.usePowerUp(session.sessionId, powerUpId);
      engineRef.current.activatePowerUp(powerUpId);
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] bg-slate-950 flex flex-col items-center justify-between overflow-hidden select-none">
      {/* Top Combat HUD */}
      <div className="w-full max-w-4xl px-4 py-3 z-20 flex items-center justify-between bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent">
        {/* Vitals: Health & Shields */}
        <div className="space-y-1.5 w-48 sm:w-64">
          {/* Health Bar */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-mono font-bold text-red-400">
              <span>HULL INTEGRITY</span>
              <span>{hudStats.health} / {hudStats.maxHealth}</span>
            </div>
            <div className="w-full bg-slate-900 border border-red-950 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-500 h-full transition-all duration-200"
                style={{ width: `${Math.max(0, (hudStats.health / hudStats.maxHealth) * 100)}%` }}
              />
            </div>
          </div>

          {/* Shield Bar */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-mono font-bold text-cyan-400">
              <span>DEFLECTOR SHIELD</span>
              <span>{hudStats.shield} / {hudStats.maxShield}</span>
            </div>
            <div className="w-full bg-slate-900 border border-cyan-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-200"
                style={{ width: `${Math.max(0, (hudStats.shield / hudStats.maxShield) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Mission & Wave Indicator */}
        <div className="text-center font-orbitron">
          <div className="text-[10px] text-cyan-400 font-mono">
            {mission.title}
          </div>
          <div className="text-xs text-slate-200 font-bold">
            WAVE {hudStats.wave} / {hudStats.totalWaves}
          </div>
        </div>

        {/* Right Score & Pause */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-mono uppercase">Score</div>
            <div className="font-orbitron font-extrabold text-base text-amber-400">
              {hudStats.score.toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => engineRef.current?.togglePause()}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Display */}
      <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={480}
          height={680}
          className="w-full max-w-[480px] h-full max-h-[680px] rounded-2xl border-2 border-cyan-500/30 shadow-2xl shadow-cyan-950 bg-slate-950 cursor-crosshair touch-none"
        />

        {/* Pause Overlay (PDF Section 21) */}
        {isPaused && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="w-72 bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-6 text-center space-y-3">
              <h3 className="font-orbitron font-extrabold text-xl text-white">TACTICAL PAUSE</h3>
              <p className="text-xs text-slate-400 font-rajdhani">Mission telemetry suspended</p>

              <button
                onClick={() => engineRef.current?.togglePause()}
                className="w-full py-2.5 rounded-xl font-orbitron text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-neon-cyan"
              >
                RESUME SORTIE
              </button>

              <button
                onClick={onExitCombat}
                className="w-full py-2.5 rounded-xl font-orbitron text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                ABANDON MISSION
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tactical Power-Up Tray */}
      <div className="w-full max-w-4xl px-4 py-2.5 z-20 flex items-center justify-center gap-2 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        {Object.entries(powerUpIcons).map(([id, Icon]) => {
          const count = profile?.powerUpInventory?.[id] || 0;
          return (
            <button
              key={id}
              disabled={count <= 0}
              onClick={() => handleUsePowerUp(id)}
              className={`relative p-2 sm:p-2.5 rounded-xl border flex flex-col items-center transition ${
                count > 0
                  ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-300 hover:border-cyan-300 shadow-neon-cyan active:scale-95'
                  : 'bg-slate-950/40 border-slate-900 text-slate-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[9px] font-mono mt-0.5 font-bold">
                x{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Revive Modal (PDF Section 41) */}
      {showReviveModal && (
        <ReviveModal
          revivesUsed={session?.revivesUsed || 0}
          maxRevives={1}
          onWatchAdRevive={handleWatchAdRevive}
          onRestart={() => { setShowReviveModal(false); initSession(); }}
          onExitHangar={onExitCombat}
        />
      )}

      {/* Victory / Result Modal (PDF Section 19 & 42-43) */}
      {showResultModal && (
        <MissionResultModal
          session={session}
          telemetry={completionTelemetry}
          stars={completionResult?.stars || 1}
          eligibleCredits={completionResult?.eligibleCredits || 100}
          eligibleXP={completionResult?.eligibleXP || 50}
          eligibleCores={completionResult?.eligibleCores || 0}
          onClaim={handleClaimFinalRewards}
          onWatchAdDoubleScore={handleWatchAdDoubleScore}
          onWatchAdDoubleCredits={handleWatchAdDoubleCredits}
          onContinue={onExitCombat}
        />
      )}

      {/* Simulated Ad Modal (PDF Section 46-50) */}
      {activeAdOpportunity && (
        <SimulatedAdModal
          opportunity={activeAdOpportunity}
          onClose={() => setActiveAdOpportunity(null)}
          onRewardGranted={(result) => {
            if (activeAdOpportunity.customCallback) {
              activeAdOpportunity.customCallback(result);
            }
            onAdRewardVerified(result);
          }}
        />
      )}
    </div>
  );
};

