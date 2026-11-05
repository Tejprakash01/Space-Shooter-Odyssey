// Mission Results, Stars, and Rewarded-Ad Bonus Offers (PDF Part II & VII, Sections 19, 42-43)
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../audio/audioManager.js';
import { Star, Trophy, Award, Coins, Zap, Shield, Play, ArrowRight, Check } from 'lucide-react';

export const MissionResultModal = ({
  session,
  telemetry,
  stars = 1,
  eligibleCredits = 100,
  eligibleXP = 50,
  eligibleCores = 0,
  onClaim,
  onWatchAdDoubleScore,
  onWatchAdDoubleCredits,
  onContinue
}) => {
  const [doubleScoreClaimed, setDoubleScoreClaimed] = useState(false);
  const [doubleCreditsClaimed, setDoubleCreditsClaimed] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  React.useEffect(() => {
    if (telemetry?.won) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  }, [telemetry]);

  const handleDoubleScore = () => {
    onWatchAdDoubleScore(() => {
      setDoubleScoreClaimed(true);
    });
  };

  const handleDoubleCredits = () => {
    onWatchAdDoubleCredits(() => {
      setDoubleCreditsClaimed(true);
    });
  };

  const handleFinalClaim = async () => {
    await onClaim();
    setIsClaimed(true);
  };

  const displayScore = doubleScoreClaimed ? telemetry.score * 2 : telemetry.score;
  const displayCredits = doubleCreditsClaimed ? eligibleCredits * 2 : eligibleCredits;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-950">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="font-orbitron font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {telemetry?.won ? 'MISSION ACCOMPLISHED' : 'MISSION REPORT'}
          </h2>
          <div className="text-xs text-slate-400 font-rajdhani uppercase tracking-widest mt-0.5">
            Combat Telemetry Verified
          </div>

          {/* 3-Star Rating (PDF Section 19) */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2, 3].map(starNum => (
              <Star
                key={starNum}
                className={`w-7 h-7 transition-all ${
                  starNum <= stars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6 text-center font-rajdhani">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase">Final Score</div>
            <div className="font-orbitron font-bold text-base text-cyan-300">
              {displayScore.toLocaleString()}
            </div>
            {doubleScoreClaimed && <span className="text-[9px] text-amber-400 font-bold uppercase">2X Boosted</span>}
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase">Enemies Down</div>
            <div className="font-orbitron font-bold text-base text-slate-100">
              {telemetry?.enemiesDefeated || 0}
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase">Accuracy</div>
            <div className="font-orbitron font-bold text-base text-emerald-400">
              {telemetry?.accuracy || 0}%
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase">Duration</div>
            <div className="font-orbitron font-bold text-base text-slate-100">
              {telemetry?.duration || 0}s
            </div>
          </div>
        </div>

        {/* Eligible Rewards Panel */}
        <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 mb-6">
          <div className="text-xs font-orbitron text-cyan-400 font-bold mb-3 flex items-center justify-between">
            <span>EARNED COMBAT REWARDS</span>
            <span className="text-[10px] text-slate-400 font-mono">AUTHORITATIVE</span>
          </div>

          <div className="flex items-center justify-around">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-orbitron font-bold text-amber-300 text-lg">
                  +{displayCredits}
                </div>
                <div className="text-[10px] text-slate-400 uppercase">Credits</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="font-orbitron font-bold text-cyan-300 text-lg">
                  +{eligibleXP}
                </div>
                <div className="text-[10px] text-slate-400 uppercase">Pilot XP</div>
              </div>
            </div>

            {eligibleCores > 0 && (
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-orbitron font-bold text-purple-300 text-lg">
                    +{eligibleCores}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase">Energy Cores</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rewarded-Ad Economy Offers (PDF Part VII, Sections 42 & 43) */}
        {!isClaimed && (
          <div className="flex flex-col gap-2 mb-6">
            {!doubleCreditsClaimed && (
              <button
                onClick={handleDoubleCredits}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-orbitron font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 fill-amber-400" />
                  <span>WATCH AD → DOUBLE CREDITS (+{eligibleCredits})</span>
                </div>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                  2X REWARD
                </span>
              </button>
            )}

            {!doubleScoreClaimed && (
              <button
                onClick={handleDoubleScore}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-orbitron font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 fill-purple-400" />
                  <span>WATCH AD → DOUBLE FINAL SCORE</span>
                </div>
                <span className="text-[10px] bg-purple-400 text-slate-950 px-2 py-0.5 rounded font-black">
                  LEADERBOARD BOOST
                </span>
              </button>
            )}
          </div>
        )}

        {/* Main Claim / Exit Buttons */}
        {!isClaimed ? (
          <button
            onClick={handleFinalClaim}
            className="w-full py-3 rounded-xl font-orbitron font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-neon-cyan flex items-center justify-center gap-2 transition"
          >
            <Coins className="w-4 h-4" />
            <span>CLAIM REWARDS & COMMIT TO LEDGER</span>
          </button>
        ) : (
          <button
            onClick={onContinue}
            className="w-full py-3 rounded-xl font-orbitron font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg flex items-center justify-center gap-2 transition"
          >
            <span>CONTINUE TO SECTOR COMMAND</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

