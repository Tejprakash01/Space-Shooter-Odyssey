import { store } from '../models/store.js';

export const getProfile = (req, res) => {
  const profile = store.getProfile(req.user.id);
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
  return res.json({ success: true, profile });
};

export const getProgress = (req, res) => {
  const profile = store.getProfile(req.user.id);
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

  return res.json({
    success: true,
    progress: {
      level: profile.level,
      xp: profile.xp,
      nextLevelXP: profile.level * 250,
      unlockedMissions: profile.unlockedMissions,
      completedMissions: profile.completedMissions,
      missionStars: profile.missionStars,
      highScores: profile.highScores,
      unlockedShips: profile.unlockedShips,
      selectedShipId: profile.selectedShipId
    }
  });
};

export const getInventory = (req, res) => {
  const profile = store.getProfile(req.user.id);
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

  return res.json({
    success: true,
    inventory: {
      powerUps: profile.powerUpInventory,
      shipUpgrades: profile.shipUpgrades
    }
  });
};

export const getHistory = (req, res) => {
  const sessions = store.getPlayerSessions(req.user.id);
  return res.json({
    success: true,
    history: sessions.slice(0, 50)
  });
};

