import { RewardedAdService } from '../services/ads/rewardedAdService.js';

export const createAdOpportunity = (req, res) => {
  try {
    const { sessionId, missionId, placementType } = req.body;
    if (!placementType) return res.status(400).json({ success: false, message: 'placementType is required' });

    const opportunity = RewardedAdService.createOpportunity(req.user.id, {
      sessionId,
      missionId,
      placementType
    });

    return res.status(201).json({
      success: true,
      opportunity
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyAdAndClaim = async (req, res) => {
  try {
    const { opportunityId, simulatedOutcome, watchDurationSeconds } = req.body;
    if (!opportunityId) return res.status(400).json({ success: false, message: 'opportunityId is required' });

    const result = await RewardedAdService.verifyAndGrantReward(req.user.id, opportunityId, {
      simulatedOutcome,
      watchDurationSeconds
    });

    return res.json({
      success: true,
      message: 'Rewarded ad verified and grant applied',
      ...result
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Specialized Revive Handlers
export const requestRevive = (req, res) => {
  try {
    const { sessionId } = req.params;
    const opp = RewardedAdService.createOpportunity(req.user.id, {
      sessionId,
      placementType: 'REVIVE'
    });
    return res.status(201).json({ success: true, opportunity: opp });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyRevive = async (req, res) => {
  try {
    const { opportunityId, simulatedOutcome = 'COMPLETED', watchDurationSeconds = 5 } = req.body;
    const result = await RewardedAdService.verifyAndGrantReward(req.user.id, opportunityId, {
      simulatedOutcome,
      watchDurationSeconds
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Specialized Double Score Handlers
export const requestDoubleScore = (req, res) => {
  try {
    const { sessionId } = req.params;
    const opp = RewardedAdService.createOpportunity(req.user.id, {
      sessionId,
      placementType: 'DOUBLE_SCORE'
    });
    return res.status(201).json({ success: true, opportunity: opp });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyDoubleScore = async (req, res) => {
  try {
    const { opportunityId, simulatedOutcome = 'COMPLETED', watchDurationSeconds = 5 } = req.body;
    const result = await RewardedAdService.verifyAndGrantReward(req.user.id, opportunityId, {
      simulatedOutcome,
      watchDurationSeconds
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Specialized Double Credits Handlers
export const requestDoubleCredits = (req, res) => {
  try {
    const { sessionId } = req.params;
    const opp = RewardedAdService.createOpportunity(req.user.id, {
      sessionId,
      placementType: 'DOUBLE_CREDITS'
    });
    return res.status(201).json({ success: true, opportunity: opp });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyDoubleCredits = async (req, res) => {
  try {
    const { opportunityId, simulatedOutcome = 'COMPLETED', watchDurationSeconds = 5 } = req.body;
    const result = await RewardedAdService.verifyAndGrantReward(req.user.id, opportunityId, {
      simulatedOutcome,
      watchDurationSeconds
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

