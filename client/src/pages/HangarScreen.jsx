// Ship Hangar & Fleet Upgrade Center (PDF Part IV, Sections 22-25)
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { sound } from '../audio/audioManager.js';
import {
  Rocket, Shield, Zap, Crosshair, Gauge, Heart,
  Flame, Check, Lock, ChevronUp, Coins, Award
} from 'lucide-react';

export const HangarScreen = ({ profile, onProfileUpdate }) => {
  const [ships, setShips] = useState([]);
  const [selectedShipId, setSelectedShipId] = useState(profile?.selectedShipId || 'interceptor');
  const [loading, setLoading] = useState(true);
  const [upgradingAttr, setUpgradingAttr] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShips();
  }, [profile]);

  const loadShips = async () => {
    try {
      const res = await api.getShips();
      setShips(res.ships || []);
      if (!selectedShipId && res.ships?.[0]) {
        setSelectedShipId(res.ships[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeShip = ships.find(s => s.id === selectedShipId) || ships[0];

  const handleSelectShip = async (shipId) => {
    sound.playClick();
    try {
      await api.selectShip(shipId);
      setSelectedShipId(shipId);
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnlockShip = async (shipId) => {
    sound.playClick();
    setError(null);
    try {
      await api.unlockShip(shipId);
      sound.playPowerUp();
      await loadShips();
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpgradeAttribute = async (attributeName) => {
    sound.playClick();
    setError(null);
    setUpgradingAttr(attributeName);
    try {
      await api.upgradeShip(activeShip.id, attributeName);
      sound.playPowerUp();
      await loadShips();
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpgradingAttr(null);
    }
  };

  if (loading || !activeShip) {
    return <div className="text-center p-12 font-orbitron text-cyan-400">Loading Fleet Hangar...</div>;
  }

  const upgradeEntries = [
    { key: 'weaponDamage', label: 'Primary Cannons', icon: Crosshair, unit: 'DMG' },
    { key: 'fireRate', label: 'Cycle Frequency', icon: Zap, unit: 's/shot' },
    { key: 'maxHealth', label: 'Hull Armor', icon: Heart, unit: 'HP' },
    { key: 'movementSpeed', label: 'Sub-Light Thrusters', icon: Gauge, unit: 'M/S' },
    { key: 'shieldCapacity', label: 'Deflector Matrix', icon: Shield, unit: 'SHD' },
    { key: 'specialCooldown', label: 'Auxiliary Core', icon: Flame, unit: 'CD' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Ship Class Selection Carousel / Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {ships.map(s => {
          const isSelected = s.id === selectedShipId;
          const isCurrentFlightShip = profile?.selectedShipId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { setSelectedShipId(s.id); sound.playClick(); }}
              className={`flex-shrink-0 w-48 p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-neon-cyan'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-cyan-400">{s.role}</span>
                {isCurrentFlightShip && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <div className="font-orbitron font-bold text-xs text-white truncate">
                {s.name}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px]">
                {s.isUnlocked ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-rajdhani">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1 font-rajdhani">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
                {isCurrentFlightShip && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                    DEPLOYED
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Main Inspection View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Ship Projection Box */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col items-center justify-between text-center min-h-[460px]">
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400">
            <span>VESSEL DESIGNATION</span>
            <span className="text-cyan-400">{activeShip.role.toUpperCase()}</span>
          </div>

          {/* Interactive Ship Render */}
          <div className="my-auto relative flex flex-col items-center">
            <div className="w-48 h-48 relative flex items-center justify-center animate-pulse">
              <Rocket
                className="w-40 h-40 transform -rotate-45 drop-shadow-[0_0_30px_rgba(0,240,255,0.6)]"
                style={{ color: activeShip.visuals?.primaryColor || '#00f0ff' }}
              />
            </div>
            <h3 className="font-orbitron font-black text-xl text-white mt-4">
              {activeShip.name}
            </h3>
            <p className="text-xs text-slate-300 font-rajdhani max-w-xs mt-1">
              {activeShip.description}
            </p>
          </div>

          {/* Ownership & Selection CTA */}
          <div className="w-full pt-4 border-t border-slate-800">
            {activeShip.isUnlocked ? (
              profile?.selectedShipId === activeShip.id ? (
                <div className="w-full py-3 rounded-xl font-orbitron text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>ACTIVE SORTIE VESSEL</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSelectShip(activeShip.id)}
                  className="w-full py-3 rounded-xl font-orbitron text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-neon-cyan transition"
                >
                  ASSIGN AS ACTIVE VESSEL
                </button>
              )
            ) : (
              <button
                onClick={() => handleUnlockShip(activeShip.id)}
                className="w-full py-3 rounded-xl font-orbitron text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-neon-gold transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>
                  UNLOCK VESSEL ({activeShip.unlockCost?.credits} Credits + {activeShip.unlockCost?.cores} Cores)
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Upgrades Matrix (PDF Part IV, Section 24 & 25) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-orbitron font-bold text-base text-white">
                Hull & Sub-System Calibrations
              </h4>
              <p className="text-xs text-slate-400 font-rajdhani">
                Server-Authoritative Level 1–5 Upgrades with Atomic Ledger Commit
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-1 rounded bg-cyan-950 border border-cyan-500/30">
              CLASS CAP: LVL 5
            </span>
          </div>

          <div className="space-y-3">
            {upgradeEntries.map(attr => {
              const Icon = attr.icon;
              const currentLvl = activeShip.currentUpgrades?.[attr.key] || 1;
              const upgradeDef = activeShip.upgrades?.[attr.key];
              const isMax = currentLvl >= 5;
              const nextLvl = currentLvl + 1;
              const creditCost = Math.round((upgradeDef?.creditCostBase || 150) * Math.pow(1.6, currentLvl - 1));
              const coreCost = nextLvl >= 4 ? 1 : 0;

              return (
                <div
                  key={attr.key}
                  className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-xs text-white">
                        {attr.label}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(lvl => (
                          <div
                            key={lvl}
                            className={`w-4 h-1.5 rounded-full transition-all ${
                              lvl <= currentLvl ? 'bg-cyan-400' : 'bg-slate-800'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                          Tier {currentLvl}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {activeShip.isUnlocked && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isMax ? (
                        <button
                          disabled={upgradingAttr === attr.key}
                          onClick={() => handleUpgradeAttribute(attr.key)}
                          className="px-3.5 py-1.5 rounded-xl font-orbitron text-[11px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 hover:shadow-neon-cyan transition flex items-center gap-1.5"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>UPGRADE ({creditCost} C{coreCost > 0 ? ` + ${coreCost} Core` : ''})</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 font-bold">
                          MAX TIER
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

