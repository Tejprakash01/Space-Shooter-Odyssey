// Pilot Dashboard, Daily Streaks, Achievements & Ledgers (PDF Part VIII & IX, Sections 52-57, 61-63)
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { sound } from '../audio/audioManager.js';
import {
  User, Award, Calendar, Gift, History, Coins, Zap,
  CheckCircle2, Clock, Check, Star, ShieldCheck, Flame
} from 'lucide-react';

export const DashboardScreen = ({ profile, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'streak', 'achievements', 'ledger'
  const [dailyMissions, setDailyMissions] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      const [dmRes, streakRes, achRes, wRes, gRes] = await Promise.all([
        api.getDailyMissions().catch(() => ({ missions: [] })),
        api.getDailyStreak().catch(() => null),
        api.getAchievements().catch(() => ({ achievements: [] })),
        api.getWalletHistory().catch(() => ({ transactions: [] })),
        api.request('/games/history').catch(() => ({ history: [] }))
      ]);

      setDailyMissions(dmRes.missions || []);
      setStreakData(streakRes);
      setAchievements(achRes.achievements || []);
      setWalletHistory(wRes.transactions || []);
      setGameHistory(gRes.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDailyMission = async (missionId) => {
    sound.playClick();
    try {
      await api.claimDailyMission(missionId);
      sound.playVictory();
      await loadDashboardData();
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClaimStreak = async () => {
    sound.playClick();
    setClaiming(true);
    try {
      await api.claimDailyStreak();
      sound.playVictory();
      await loadDashboardData();
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Pilot Identity Banner */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 font-orbitron font-extrabold text-2xl shadow-neon-cyan">
            {profile?.selectedShipId?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-orbitron font-extrabold text-xl text-white">
                Federation Pilot Dossier
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                ACTIVE
              </span>
            </div>
            <div className="text-xs text-slate-400 font-rajdhani mt-0.5">
              Rank Tier {profile?.level || 1} Starfighter Pilot • Level Progress ({profile?.xp || 0} / {(profile?.level || 1) * 250} XP)
            </div>
          </div>
        </div>

        {/* Currency summary tabs */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Spendable Credits</div>
            <div className="font-orbitron font-bold text-amber-400 text-lg">
              {profile?.credits?.toLocaleString() || 0}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Energy Cores</div>
            <div className="font-orbitron font-bold text-purple-400 text-lg">
              {profile?.energyCores || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Daily Ops & Streaks', icon: Calendar },
          { id: 'achievements', label: 'Achievements (10)', icon: Award },
          { id: 'ledger', label: 'Authoritative Wallet Ledger', icon: History }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); sound.playClick(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-orbitron text-xs transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Daily Ops & Streaks (PDF Section 52 & 53) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 7-Day Login Streak Calendar */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-orbitron font-bold text-base text-white">
                  7-Day Login Streak Protocol
                </h3>
                <p className="text-xs text-slate-400 font-rajdhani">
                  Consecutive daily logins reward escalating Credits & Energy Cores
                </p>
              </div>
              <span className="font-orbitron font-bold text-amber-400 text-sm">
                Day {streakData?.currentStreak || 1} Active
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6, 7].map(d => {
                const isClaimed = d < (streakData?.currentStreak || 1);
                const isCurrent = d === (streakData?.currentStreak || 1);
                return (
                  <div
                    key={d}
                    className={`rounded-2xl p-2.5 text-center border flex flex-col justify-between h-24 ${
                      isCurrent
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-neon-cyan'
                        : isClaimed
                        ? 'bg-slate-950/60 border-slate-800 text-slate-500'
                        : 'bg-slate-950/40 border-slate-900 text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-mono">Day {d}</span>
                    <div className="my-auto font-orbitron font-bold text-xs text-amber-400">
                      +{100 + d * 50}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {isClaimed ? 'Claimed' : isCurrent ? 'Ready' : 'Locked'}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleClaimStreak}
              disabled={claiming}
              className="w-full py-3 rounded-2xl font-orbitron text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-neon-gold transition"
            >
              CLAIM TODAY'S DAILY STREAK REWARD
            </button>
          </div>

          {/* Daily Missions */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="font-orbitron font-bold text-base text-white">
                Daily Tactical Directives
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Reset every 24 hours UTC
              </p>
            </div>

            <div className="space-y-3">
              {dailyMissions.map(m => (
                <div key={m.id} className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-orbitron font-bold text-xs text-slate-100">{m.title}</span>
                    <span className="text-xs font-mono text-amber-400">+{m.rewardCredits} C</span>
                  </div>
                  <p className="text-xs text-slate-400 font-rajdhani mb-2">{m.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full"
                        style={{ width: `${Math.min(100, (m.currentProgress / m.target) * 100)}%` }}
                      />
                    </div>
                    {m.isCompleted ? (
                      <button
                        onClick={() => handleClaimDailyMission(m.id)}
                        className="px-3 py-1 rounded-lg text-[10px] font-orbitron bg-emerald-500 text-slate-950 font-bold"
                      >
                        Claim
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">
                        {m.currentProgress}/{m.target}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Achievements (PDF Section 54) */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                ach.isUnlocked
                  ? 'bg-slate-900/90 border-amber-500/50 shadow-neon-gold text-slate-100'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono uppercase ${ach.isUnlocked ? 'text-amber-400' : 'text-slate-600'}`}>
                    {ach.isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                  <Award className={`w-4 h-4 ${ach.isUnlocked ? 'text-amber-400' : 'text-slate-700'}`} />
                </div>
                <h4 className="font-orbitron font-bold text-xs mb-1">{ach.name}</h4>
                <p className="text-[11px] font-rajdhani leading-snug">{ach.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-amber-400">
                Reward: +{ach.rewardCredits} Credits
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Authoritative Wallet Ledger (PDF Section 36 & 37) */}
      {activeTab === 'ledger' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-orbitron font-bold text-base text-white">
                Authoritative Wallet Ledger Audit
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Every credit & core transaction is server-recorded with before/after balance tracking.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Total Records: {walletHistory.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-rajdhani">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2 px-3">Transaction ID</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Delta</th>
                  <th className="py-2 px-3">Balance Before</th>
                  <th className="py-2 px-3">Balance After</th>
                  <th className="py-2 px-3">Source</th>
                  <th className="py-2 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {walletHistory.slice(0, 15).map(tx => (
                  <tr key={tx.transactionId} className="hover:bg-slate-950/40">
                    <td className="py-2.5 px-3 text-slate-400">{tx.transactionId.slice(0, 12)}...</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        tx.type === 'CREDIT' || tx.type === 'MISSION_REWARD' || tx.type === 'AD_REWARD'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-950 text-red-400 border border-red-500/30'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {tx.type === 'UPGRADE_PURCHASE' || tx.type === 'DEBIT' ? '-' : '+'}{tx.amount}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{tx.balanceBefore}</td>
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{tx.balanceAfter}</td>
                    <td className="py-2.5 px-3 text-slate-400">{tx.source}</td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

