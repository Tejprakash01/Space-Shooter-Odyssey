import { MISSIONS_DATA, SECTORS_DATA } from '../data/missionsData.js';
import { BOSSES_DATA } from '../data/bossesData.js';
import { GameSessionService } from '../services/game/sessionService.js';
import { store } from '../models/store.js';

export const getAllMissions = (req, res) => {
  const profile = req.user ? store.getProfile(req.user.id) : null;
  const unlockedList = profile ? profile.unlockedMissions : ['mission-01'];
  const completedList = profile ? profile.completedMissions : [];
  const starsMap = profile ? profile.missionStars : {};

  const missions = MISSIONS_DATA.map(m => ({
    ...m,
    isUnlocked: unlockedList.includes(m.id),
    isCompleted: completedList.includes(m.id),
    starsEarned: starsMap[m.id] || 0
  }));

  return res.json({
    success: true,
    sectors: SECTORS_DATA,
    missions
  });
};

export const getMissionById = (req, res) => {
  const { missionId } = req.params;
  const mission = MISSIONS_DATA.find(m => m.id === missionId);
  if (!mission) return res.status(404).json({ success: false, message: 'Mission not found' });

  let boss = null;
  if (mission.bossId) {
    boss = BOSSES_DATA.find(b => b.id === mission.bossId);
  }

  return res.json({
    success: true,
    mission,
    boss
  });
};

export const startGameSession = (req, res) => {
  try {
    const { missionId, shipId } = req.body;
    if (!missionId || !shipId) {
      return res.status(400).json({ success: false, message: 'missionId and shipId are required' });
    }

    const session = GameSessionService.startSession(req.user.id, { missionId, shipId });
    return res.status(201).json({
      success: true,
      sessionId: session.sessionId,
      session
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const completeGameSession = (req, res) => {
  try {
    const { sessionId } = req.params;
    const telemetry = req.body;

    const result = GameSessionService.completeSession(req.user.id, sessionId, telemetry);
    return res.json({
      success: true,
      message: telemetry.won ? 'Mission accomplished!' : 'Ship was destroyed in combat',
      ...result
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const claimGameSessionRewards = (req, res) => {
  try {
    const { sessionId } = req.params;
    const claimResult = GameSessionService.claimMissionRewards(req.user.id, sessionId);
    return res.json({
      success: true,
      message: 'Rewards claimed and deposited into pilot ledger',
      ...claimResult
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getGameHistory = (req, res) => {
  const sessions = store.getPlayerSessions(req.user.id);
  return res.json({
    success: true,
    history: sessions
  });
};

