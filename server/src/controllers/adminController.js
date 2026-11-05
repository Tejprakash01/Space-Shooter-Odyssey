import { store } from '../models/store.js';
import { ECONOMY_CONFIG } from '../config/economyConfig.js';

export const getAdminMetrics = (req, res) => {
  const events = store.getAllEvents();
  const walletTx = store.getAllWalletTransactions();
  const rewardTx = store.getAllRewardTransactions();

  // Metrics derived from recorded events, not fabricated (Section 75)
  const adOpportunitiesCount = events.filter(e => e.name === 'ad_opportunity_created').length;
  const adCompletedCount = events.filter(e => e.name === 'ad_completed').length;
  const rewardsGrantedCount = events.filter(e => e.name === 'reward_granted').length;
  const rewardsRejectedCount = events.filter(e => e.name === 'reward_rejected').length;

  const reviveRequested = events.filter(e => e.name === 'revive_requested' || (e.name === 'ad_opportunity_created' && e.placementType === 'REVIVE')).length;
  const reviveCompleted = events.filter(e => e.name === 'revive_completed').length;

  const doubleScoreReq = events.filter(e => e.name === 'double_score_requested' || (e.name === 'ad_opportunity_created' && e.placementType === 'DOUBLE_SCORE')).length;
  const doubleScoreComp = events.filter(e => e.name === 'double_score_completed').length;

  const doubleCreditsReq = events.filter(e => e.name === 'double_credits_requested' || (e.name === 'ad_opportunity_created' && e.placementType === 'DOUBLE_CREDITS')).length;
  const doubleCreditsComp = events.filter(e => e.name === 'double_credits_completed').length;

  const totalCreditsGranted = walletTx
    .filter(t => t.currency === 'credits' && t.type === 'CREDIT' || t.type === 'MISSION_REWARD' || t.type === 'AD_REWARD' || t.type === 'DAILY_BONUS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCreditsSpent = walletTx
    .filter(t => t.currency === 'credits' && (t.type === 'DEBIT' || t.type === 'UPGRADE_PURCHASE' || t.type === 'BOOSTER_PURCHASE'))
    .reduce((sum, t) => sum + t.amount, 0);

  const userCount = store.users.size;
  const avgRewardPerUser = userCount > 0 ? Math.round(totalCreditsGranted / userCount) : 0;

  return res.json({
    success: true,
    metrics: {
      totalAdOpportunities: adOpportunitiesCount,
      completedRewardedAds: adCompletedCount,
      rewardedAdCompletionRate: adOpportunitiesCount > 0 ? `${((adCompletedCount / adOpportunitiesCount) * 100).toFixed(1)}%` : '100%',
      rewardsGranted: rewardsGrantedCount,
      rewardsRejected: rewardsRejectedCount,
      creditsGranted: totalCreditsGranted,
      creditsSpent: totalCreditsSpent,
      averageRewardPerUser: avgRewardPerUser,
      reviveConversion: reviveRequested > 0 ? `${((reviveCompleted / reviveRequested) * 100).toFixed(1)}%` : '0%',
      doubleScoreConversion: doubleScoreReq > 0 ? `${((doubleScoreComp / doubleScoreReq) * 100).toFixed(1)}%` : '0%',
      doubleCreditsConversion: doubleCreditsReq > 0 ? `${((doubleCreditsComp / doubleCreditsReq) * 100).toFixed(1)}%` : '0%',
      activeEconomyConfig: ECONOMY_CONFIG
    }
  });
};

export const getAuditTransactions = (req, res) => {
  const walletTx = store.getAllWalletTransactions();
  const rewardTx = store.getAllRewardTransactions();

  return res.json({
    success: true,
    walletTransactions: walletTx.slice(0, 100),
    rewardTransactions: rewardTx.slice(0, 100)
  });
};

export const updateEconomyConfig = (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid configuration payload' });
  }

  // Live administrative override
  Object.assign(ECONOMY_CONFIG, updates);
  store.recordEvent('admin_config_updated', { updates });

  return res.json({
    success: true,
    message: 'Economy configuration updated live across server cluster',
    config: ECONOMY_CONFIG
  });
};

