// Galactic Leaderboard (PDF Part VIII, Section 59)
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Trophy, Award, Shield, CheckCircle2, Star } from 'lucide-react';

export const LeaderboardScreen = ({ profile }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerRank, setPlayerRank] = useState(2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await api.getLeaderboard();
      setLeaderboard(res.leaderboard || []);
      setPlayerRank(res.playerRank || 2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 mb-1 shadow-neon-gold">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="font-orbitron font-extrabold text-3xl text-white">
          Federation Pilot Rankings
        </h2>
        <p className="text-xs text-slate-400 font-rajdhani max-w-lg mx-auto">
          Authoritative leaderboard synchronized with server-validated combat records and telemetry checks.
        </p>
      </div>

      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 overflow-hidden shadow-2xl">
        <table className="w-full text-left font-rajdhani">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-xs">
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Callsign</th>
              <th className="py-3 px-4">Missions</th>
              <th className="py-3 px-4">Vessel</th>
              <th className="py-3 px-4 text-right">Validated Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {leaderboard.map(p => {
              const isUser = p.rank === playerRank;
              return (
                <tr
                  key={p.rank}
                  className={`transition-colors ${
                    isUser
                      ? 'bg-cyan-950/40 font-bold border-l-4 border-cyan-400 text-cyan-200'
                      : 'hover:bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <td className="py-3.5 px-4 font-orbitron">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      p.rank === 1
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : p.rank === 2
                        ? 'bg-slate-300 text-slate-950 font-black'
                        : p.rank === 3
                        ? 'bg-amber-700 text-white font-bold'
                        : 'text-slate-500'
                    }`}>
                      {p.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold flex items-center gap-2">
                    <span>{p.displayName}</span>
                    {isUser && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                    {p.missionsCompleted}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                    {p.ship}
                  </td>
                  <td className="py-3.5 px-4 text-right font-orbitron font-bold text-amber-400">
                    {p.score.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

