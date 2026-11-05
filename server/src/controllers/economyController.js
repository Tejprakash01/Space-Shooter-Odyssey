import { ECONOMY_CONFIG } from '../config/economyConfig.js';
import { POWERUPS_DATA } from '../data/powerupsData.js';
import { WalletService } from '../services/economy/walletService.js';
import { store } from '../models/store.js';

export const getEconomyConfig = (req, res) => {
  return res.json({
    success: true,
    config: ECONOMY_CONFIG
  });
};

export const getWalletBalance = (req, res) => {
  try {
    const balances = WalletService.getBalances(req.user.id);
    return res.json({ success: true, balances });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getWalletHistory = (req, res) => {
  const transactions = store.getWalletTransactions(req.user.id);
  return res.json({
    success: true,
    transactions
  });
};

export const getRewardHistory = (req, res) => {
  const history = store.getRewardTransactions(req.user.id);
  return res.json({
    success: true,
    rewards: history
  });
};

export const getAllPowerUps = (req, res) => {
  const profile = req.user ? store.getProfile(req.user.id) : null;
  const inventory = profile ? profile.powerUpInventory : {};

  const powerups = POWERUPS_DATA.map(p => ({
    ...p,
    ownedCount: inventory[p.id] || 0
  }));

  return res.json({ success: true, powerups });
};

export const acquirePowerUp = (req, res) => {
  try {
    const { powerUpId } = req.params;
    const quantity = Number(req.body.quantity) || 1;
    const result = WalletService.acquirePowerUp(req.user.id, powerUpId, quantity);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const usePowerUpInCombat = (req, res) => {
  try {
    const { sessionId } = req.params;
    const { powerUpId } = req.body;
    if (!powerUpId) return res.status(400).json({ success: false, message: 'powerUpId is required' });

    const session = store.getSession(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    const profile = store.getProfile(req.user.id);
    const count = profile.powerUpInventory[powerUpId] || 0;
    if (count <= 0) {
      return res.status(400).json({ success: false, message: 'None in inventory' });
    }

    profile.powerUpInventory[powerUpId] = count - 1;
    store.updateProfile(req.user.id, profile);

    session.stats.powerUpsUsed.push({
      powerUpId,
      timestamp: Date.now()
    });
    store.updateSession(sessionId, session);
    store.recordEvent('powerup_used', { userId: req.user.id, sessionId, powerUpId });

    return res.json({
      success: true,
      remainingCount: profile.powerUpInventory[powerUpId]
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

