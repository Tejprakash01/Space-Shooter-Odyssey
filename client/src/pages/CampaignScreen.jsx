// Campaign & 50-Mission Sector Navigation (PDF Part III, Sections 14-18)
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { sound } from '../audio/audioManager.js';
import {
  Layers, Lock, Play, Star, Skull, Shield, CheckCircle2,
  ChevronRight, Award, Coins, Zap, Target
} from 'lucide-react';

export const CampaignScreen = ({ profile, onSelectMission }) => {
  const [sectors, setSectors] = useState([]);
  const [missions, setMissions] = useState([]);
  const [selectedSectorId, setSelectedSectorId] = useState('orion-frontier');
  const [activeMissionBriefing, setActiveMissionBriefing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMissions();
  }, [profile]);

  const loadMissions = async () => {
    try {
      const res = await api.getMissions();
      setSectors(res.sectors || []);
      setMissions(res.missions || []);
    } catch (err) {
      console.error('Failed to load campaign data', err);
    } finally {
      setLoading(false);
    }
  };

  const currentSector = sectors.find(s => s.id === selectedSectorId) || sectors[0];
  const sectorMissions = missions.filter(m => m.sectorId === selectedSectorId);

  const handleMissionClick = (mission) => {
    sound.playClick();
    if (!mission.isUnlocked) {
      alert('Mission Locked: Complete previous campaign missions to decrypt hyperspace coordinates.');
      return;
    }
    setActiveMissionBriefing(mission);
  };

  const handleLaunch = () => {
    sound.playClick();
    if (activeMissionBriefing) {
      onSelectMission(activeMissionBriefing);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-cyan-400 font-orbitron">
        Decrypting Galactic Sector Coordinates...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Sector Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {sectors.map((sec, idx) => {
          const isActive = sec.id === selectedSectorId;
          return (
            <button
              key={sec.id}
              onClick={() => { setSelectedSectorId(sec.id); sound.playClick(); }}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-slate-900 border-cyan-400 text-white shadow-neon-cyan'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                Sector 0{idx + 1}
              </div>
              <div className="font-orbitron font-bold text-xs md:text-sm mt-0.5">
                {sec.name.split(':')[1]?.trim() || sec.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sector Overview Banner */}
      {currentSector && (
        <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 p-6 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: currentSector.theme?.primaryColor || '#00f0ff' }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-orbitron font-extrabold text-2xl text-white">
                {currentSector.name}
              </h2>
              <p className="text-sm text-slate-300 font-rajdhani max-w-2xl mt-1">
                {currentSector.description}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Campaign Range</div>
                <div className="font-orbitron font-bold text-xs text-cyan-400">
                  Missions {currentSector.missionRange?.[0]} - {currentSector.missionRange?.[1]}
                </div>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Sector Flagship</div>
                <div className="font-orbitron font-bold text-xs text-red-400 flex items-center gap-1">
                  <Skull className="w-3.5 h-3.5" />
                  <span>{currentSector.bossId?.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10 Missions Grid for Active Sector (Total 50 Playable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sectorMissions.map(m => {
          const isBoss = !!m.bossId;
          return (
            <div
              key={m.id}
              onClick={() => handleMissionClick(m)}
              className={`relative rounded-2xl border p-4 cursor-pointer transition-all transform hover:-translate-y-1 ${
                !m.isUnlocked
                  ? 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-70'
                  : isBoss
                  ? 'bg-gradient-to-b from-red-950/30 via-slate-900 to-slate-950 border-red-500/50 hover:border-red-400 text-slate-100 shadow-lg shadow-red-950/30'
                  : m.isCompleted
                  ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 text-slate-100'
                  : 'bg-slate-900/60 border-slate-700 hover:border-cyan-400 text-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                  #{m.sequence < 10 ? '0' + m.sequence : m.sequence}
                </span>

                {isBoss ? (
                  <span className="flex items-center gap-1 text-[10px] font-orbitron font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
                    <Skull className="w-3 h-3" /> BOSS
                  </span>
                ) : (
                  <span className="text-[10px] font-rajdhani uppercase text-slate-400">
                    {m.difficulty}
                  </span>
                )}
              </div>

              {/* Title & Objective */}
              <h4 className="font-orbitron font-bold text-sm mb-1 line-clamp-1">
                {m.title}
              </h4>
              <p className="text-xs text-slate-400 font-rajdhani line-clamp-2 h-8 mb-3">
                {m.objective?.description}
              </p>

              {/* Card Footer: Stars & Status */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map(st => (
                    <Star
                      key={st}
                      className={`w-3.5 h-3.5 ${
                        st <= (m.starsEarned || 0)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {!m.isUnlocked ? (
                  <Lock className="w-4 h-4 text-slate-600" />
                ) : m.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Play className="w-4 h-4 text-cyan-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mission Briefing Launch Modal */}
      {activeMissionBriefing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 shadow-2xl shadow-cyan-950">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  Mission Briefing • Sequence #{activeMissionBriefing.sequence}
                </span>
                <h3 className="font-orbitron font-black text-xl text-white mt-0.5">
                  {activeMissionBriefing.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveMissionBriefing(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Objective Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 text-xs font-orbitron text-cyan-400 mb-1.5">
                <Target className="w-4 h-4" />
                <span>PRIMARY MISSION OBJECTIVE</span>
              </div>
              <p className="text-sm text-slate-200 font-rajdhani font-semibold">
                {activeMissionBriefing.objective?.description}
              </p>
              <div className="text-[11px] text-slate-400 mt-2 font-mono">
                Hostile Waves: {activeMissionBriefing.waves?.length} Combat Waves
              </div>
            </div>

            {/* 3-Star Criteria */}
            <div className="space-y-1.5 mb-5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-xs font-rajdhani">
              <div className="text-[10px] font-orbitron text-amber-400 uppercase">Performance Star Ratings</div>
              <div className="flex items-center gap-2 text-slate-300">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{activeMissionBriefing.starConditions?.oneStar}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{activeMissionBriefing.starConditions?.twoStar}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{activeMissionBriefing.starConditions?.threeStar}</span>
              </div>
            </div>

            {/* Reward Potential */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 mb-6">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="font-orbitron text-sm font-bold text-amber-300">
                  +{activeMissionBriefing.rewards?.credits} Credits
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span className="font-orbitron text-sm font-bold text-cyan-300">
                  +{activeMissionBriefing.rewards?.xp} XP
                </span>
              </div>
              {activeMissionBriefing.rewards?.cores > 0 && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="font-orbitron text-sm font-bold text-purple-300">
                    +{activeMissionBriefing.rewards?.cores} Cores
                  </span>
                </div>
              )}
            </div>

            {/* Launch Action */}
            <button
              onClick={handleLaunch}
              className="w-full py-3.5 rounded-2xl font-orbitron font-black text-sm bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-neon-cyan flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ENGAGE HYPERDRIVE & COMMENCE COMBAT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

