import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

import * as authCtrl from '../controllers/authController.js';
import * as playerCtrl from '../controllers/playerController.js';
import * as missionCtrl from '../controllers/missionController.js';
import * as shipCtrl from '../controllers/shipController.js';
import * as economyCtrl from '../controllers/economyController.js';
import * as adCtrl from '../controllers/adController.js';
import * as engageCtrl from '../controllers/engagementController.js';
import * as adminCtrl from '../controllers/adminController.js';

const router = express.Router();

// 1. Auth Group (Section 60)
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.post('/auth/logout', authCtrl.logout);
router.get('/auth/me', authenticateToken, authCtrl.getMe);

// 2. Player Group (Section 61 & 68)
router.get('/player/profile', authenticateToken, playerCtrl.getProfile);
router.get('/player/progress', authenticateToken, playerCtrl.getProgress);
router.get('/player/inventory', authenticateToken, playerCtrl.getInventory);
router.get('/player/history', authenticateToken, playerCtrl.getHistory);

// 3. Missions & Games Group (Section 14-20 & 68)
router.get('/missions', authenticateToken, missionCtrl.getAllMissions);
router.get('/missions/:missionId', authenticateToken, missionCtrl.getMissionById);
router.post('/games/start', authenticateToken, missionCtrl.startGameSession);
router.post('/games/:sessionId/complete', authenticateToken, missionCtrl.completeGameSession);
router.post('/games/:sessionId/claim', authenticateToken, missionCtrl.claimGameSessionRewards);
router.get('/games/history', authenticateToken, missionCtrl.getGameHistory);

// 4. Ships Fleet & Upgrades (Section 22-25 & 68)
router.get('/ships', authenticateToken, shipCtrl.getAllShips);
router.get('/ships/owned', authenticateToken, shipCtrl.getOwnedShips);
router.post('/ships/:shipId/select', authenticateToken, shipCtrl.selectShip);
router.post('/ships/:shipId/upgrade', authenticateToken, shipCtrl.upgradeShip);
router.post('/ships/:shipId/unlock', authenticateToken, shipCtrl.unlockShip);

// 5. Power-Ups Group (Section 26-28 & 68)
router.get('/powerups', authenticateToken, economyCtrl.getAllPowerUps);
router.post('/powerups/:powerUpId/acquire', authenticateToken, economyCtrl.acquirePowerUp);
router.post('/games/:sessionId/powerups/use', authenticateToken, economyCtrl.usePowerUpInCombat);

// 6. Economy & Wallet (Section 31-36 & 68)
router.get('/economy/config', economyCtrl.getEconomyConfig);
router.get('/wallet/balance', authenticateToken, economyCtrl.getWalletBalance);
router.get('/wallet/history', authenticateToken, economyCtrl.getWalletHistory);
router.get('/rewards/history', authenticateToken, economyCtrl.getRewardHistory);

// 7. Rewarded Ads & Placements (Section 40-47 & 68)
router.post('/rewards/ad/opportunity', authenticateToken, adCtrl.createAdOpportunity);
router.post('/rewards/ad/verify', authenticateToken, adCtrl.verifyAdAndClaim);
router.post('/rewards/ad/claim', authenticateToken, adCtrl.verifyAdAndClaim);

// Specialized Placements (Revive, Double Score, Double Credits)
router.post('/games/:sessionId/revive/request', authenticateToken, adCtrl.requestRevive);
router.post('/games/:sessionId/revive/verify', authenticateToken, adCtrl.verifyRevive);
router.post('/games/:sessionId/double-score/request', authenticateToken, adCtrl.requestDoubleScore);
router.post('/games/:sessionId/double-score/verify', authenticateToken, adCtrl.verifyDoubleScore);
router.post('/games/:sessionId/double-credits/request', authenticateToken, adCtrl.requestDoubleCredits);
router.post('/games/:sessionId/double-credits/verify', authenticateToken, adCtrl.verifyDoubleCredits);

// 8. Engagement & Retention (Section 52-59 & 68)
router.get('/daily-missions', authenticateToken, engageCtrl.getDailyMissions);
router.post('/daily-missions/:missionId/claim', authenticateToken, engageCtrl.claimDailyMission);
router.get('/achievements', authenticateToken, engageCtrl.getAchievements);
router.get('/leaderboard', authenticateToken, engageCtrl.getLeaderboard);
router.get('/events', authenticateToken, engageCtrl.getEvents);
router.get('/daily-streak', authenticateToken, engageCtrl.getDailyStreak);
router.post('/daily-streak/claim', authenticateToken, engageCtrl.claimDailyStreak);
router.post('/supply-drop/claim', authenticateToken, engageCtrl.claimSupplyDrop);

// 9. Admin Audit & Economy Dashboard (Section 74-77)
router.get('/admin/metrics', authenticateToken, requireAdmin, adminCtrl.getAdminMetrics);
router.get('/admin/transactions', authenticateToken, requireAdmin, adminCtrl.getAuditTransactions);
router.post('/admin/config', authenticateToken, requireAdmin, adminCtrl.updateEconomyConfig);

export default router;

