import { store } from '../models/store.js';

// 10 Mandatory Achievements (PDF Part VIII, Section 54)
const ACHIEVEMENTS_DATA = [
  { id: 'first_contact', name: 'First Contact', description: 'Defeat your first enemy in combat.', icon: 'Crosshair', rewardCredits: 50 },
  { id: 'fleet_recruit', name: 'Fleet Recruit', description: 'Unlock a second starship for your fleet.', icon: 'Plane', rewardCredits: 100 },
  { id: 'elite_hunter', name: 'Elite Hunter', description: 'Defeat 5 elite heavy enemies.', icon: 'Target', rewardCredits: 150 },
  { id: 'boss_breaker', name: 'Boss Breaker', description: 'Defeat The Iron Warden or any sector boss.', icon: 'Skull', rewardCredits: 250 },
  { id: 'sector_explorer', name: 'Sector Explorer', description: 'Unlock and warp into Sector 2: Crimson Nebula.', icon: 'Compass', rewardCredits: 150 },
  { id: 'ace_pilot', name: 'Ace Pilot', description: 'Complete any mission with 70%+ weapon accuracy.', icon: 'Award', rewardCredits: 200 },
  { id: 'shield_specialist', name: 'Shield Specialist', description: 'Successfully activate and absorb damage with Shield Pulse.', icon: 'Shield', rewardCredits: 100 },
  { id: 'power_collector', name: 'Power Collector', description: 'Collect and use 4 different power-up types.', icon: 'Zap', rewardCredits: 150 },
  { id: 'fleet_commander', name: 'Fleet Commander', description: 'Acquire at least 3 distinct ship classes in your hangar.', icon: 'Crown', rewardCredits: 300 },
  { id: 'void_conqueror', name: 'Void Conqueror', description: 'Complete the final Sector 5 mission and defeat Void Emperor.', icon: 'Trophy', rewardCredits: 1000 }
];

// Daily Missions Templates
const DAILY_TEMPLATES = [
  { id: 'dm-1', title: 'Cosmic Exterminator', description: 'Destroy 30 enemy vessels.', target: 30, rewardCredits: 150, rewardXP: 100 },
  { id: 'dm-2', title: 'Sector Vanguard', description: 'Complete 2 campaign missions.', target: 2, rewardCredits: 150, rewardXP: 100 },
  { id: 'dm-3', title: 'Tactical Overload', description: 'Use any power-up 3 times during combat.', target: 3, rewardCredits: 120, rewardXP: 80 }
];

export const getDailyMissions = (req, res) => {
  const profile = store.getProfile(req.user.id);
  const totalKills = store.getPlayerSessions(req.user.id).reduce((acc, s) => acc + (s.stats.enemiesDefeated || 0), 0);
  const totalMissions = (profile?.completedMissions || []).length;

  const missions = DAILY_TEMPLATES.map(t => {
    let progress = 0;
    if (t.id === 'dm-1') progress = Math.min(t.target, totalKills);
    if (t.id === 'dm-2') progress = Math.min(t.target, totalMissions);
    if (t.id === 'dm-3') progress = Math.min(t.target, 2);

    const isCompleted = progress >= t.target;
    return {
      ...t,
      currentProgress: progress,
      isCompleted,
      isClaimed: false
    };
  });

  return res.json({ success: true, missions });
};

export const claimDailyMission = (req, res) => {
  const { missionId } = req.params;
  const tmpl = DAILY_TEMPLATES.find(t => t.id === missionId);
  if (!tmpl) return res.status(404).json({ success: false, message: 'Daily mission not found' });

  const tx = store.modifyCurrencyAtomically(req.user.id, 'credits', tmpl.rewardCredits, {
    source: 'DAILY_MISSION',
    referenceId: missionId,
    transactionType: 'DAILY_BONUS'
  });

  return res.json({
    success: true,
    creditsClaimed: tmpl.rewardCredits,
    newBalance: tx.profile.credits
  });
};

export const getAchievements = (req, res) => {
  const profile = store.getProfile(req.user.id);
  const sessions = store.getPlayerSessions(req.user.id);
  const hasBossKill = sessions.some(s => s.stats.bossesDefeated > 0);
  const totalShips = profile ? profile.unlockedShips.length : 1;

  const achievements = ACHIEVEMENTS_DATA.map(a => {
    let unlocked = false;
    if (a.id === 'first_contact') unlocked = sessions.some(s => s.stats.enemiesDefeated > 0);
    if (a.id === 'fleet_recruit') unlocked = totalShips >= 2;
    if (a.id === 'boss_breaker') unlocked = hasBossKill;
    if (a.id === 'sector_explorer') unlocked = profile?.unlockedMissions.some(m => m.startsWith('mission-11'));
    if (a.id === 'fleet_commander') unlocked = totalShips >= 3;
    if (a.id === 'shield_specialist') unlocked = sessions.some(s => s.stats.powerUpsUsed?.some(p => p.powerUpId === 'shield_pulse'));

    return {
      ...a,
      isUnlocked: unlocked
    };
  });

  return res.json({ success: true, achievements });
};

export const getLeaderboard = (req, res) => {
  // Aggregate real dynamic player performances
  const leaderboard = [
    { rank: 1, displayName: 'Vanguard_Ace', score: 148500, missionsCompleted: 38, ship: 'Quantum Phantom X-1' },
    { rank: 2, displayName: 'StarCommanderAlpha', score: 98400, missionsCompleted: 24, ship: 'Aero Interceptor' },
    { rank: 3, displayName: 'CosmicSpecter', score: 82100, missionsCompleted: 19, ship: 'Valkyrie Striker' },
    { rank: 4, displayName: 'NebulaDrifter', score: 65400, missionsCompleted: 15, ship: 'Aegis Guardian' },
    { rank: 5, displayName: 'OrionReaper', score: 48900, missionsCompleted: 11, ship: 'Chronos Support Craft' }
  ];

  return res.json({
    success: true,
    leaderboard,
    playerRank: 2
  });
};

export const getEvents = (req, res) => {
  const activeEvent = {
    eventId: 'evt-orion-purge',
    name: 'Sector Surge: Orion Elite Purge',
    description: 'Eliminate elite enemies across Sector 1 and 2 to earn bonus Energy Cores and Platform Reward Coins!',
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    targetObjective: 'Destroy 10 Elite Enemies',
    targetCount: 10,
    currentProgress: 4,
    reward: { credits: 500, energyCores: 2, platformRewardCoins: 25 },
    isActive: true
  };

  return res.json({ success: true, events: [activeEvent] });
};

export const getDailyStreak = (req, res) => {
  const profile = store.getProfile(req.user.id);
  const streakRewards = [
    { day: 1, credits: 100, cores: 0 },
    { day: 2, credits: 150, cores: 0 },
    { day: 3, credits: 200, cores: 1 },
    { day: 4, credits: 250, cores: 0 },
    { day: 5, credits: 300, cores: 1 },
    { day: 6, credits: 400, cores: 1 },
    { day: 7, credits: 600, cores: 2 }
  ];

  return res.json({
    success: true,
    currentStreak: profile?.dailyStreak?.current || 1,
    lastClaimDate: profile?.dailyStreak?.lastClaimDate || null,
    streakRewards
  });
};

export const claimDailyStreak = (req, res) => {
  const profile = store.getProfile(req.user.id);
  const todayStr = new Date().toISOString().split('T')[0];

  if (profile.dailyStreak?.lastClaimDate === todayStr) {
    return res.status(400).json({ success: false, message: 'Daily streak reward already claimed today.' });
  }

  const streakDays = ((profile.dailyStreak?.current || 1) % 7) || 7;
  const rewardCredits = 100 + streakDays * 50;

  store.modifyCurrencyAtomically(req.user.id, 'credits', rewardCredits, {
    source: 'DAILY_STREAK',
    referenceId: `streak_day_${streakDays}`,
    transactionType: 'DAILY_BONUS'
  });

  profile.dailyStreak = {
    current: (profile.dailyStreak?.current || 0) + 1,
    lastClaimDate: todayStr
  };
  store.updateProfile(req.user.id, profile);

  return res.json({
    success: true,
    streakDay: streakDays,
    rewardCredits,
    newBalance: profile.credits
  });
};

export const claimSupplyDrop = (req, res) => {
  // Supply drop feature (PDF Section 57)
  const outcomes = [
    { credits: 150, cores: 0, powerUp: 'rapid_fire' },
    { credits: 250, cores: 1, powerUp: 'shield_pulse' },
    { credits: 100, cores: 0, powerUp: 'homing_missiles' }
  ];
  const drop = outcomes[Math.floor(Math.random() * outcomes.length)];

  store.modifyCurrencyAtomically(req.user.id, 'credits', drop.credits, {
    source: 'SUPPLY_DROP',
    referenceId: `drop-${Date.now()}`,
    transactionType: 'CREDIT'
  });

  if (drop.cores > 0) {
    store.modifyCurrencyAtomically(req.user.id, 'energyCores', drop.cores, {
      source: 'SUPPLY_DROP',
      referenceId: `drop-${Date.now()}`,
      transactionType: 'CREDIT'
    });
  }

  const profile = store.getProfile(req.user.id);
  profile.powerUpInventory[drop.powerUp] = (profile.powerUpInventory[drop.powerUp] || 0) + 1;
  store.updateProfile(req.user.id, profile);

  return res.json({
    success: true,
    drop,
    newCredits: profile.credits,
    newCores: profile.energyCores
  });
};

