// Rewarded Ad Service (PDF Part VII, Sections 40-51)
import { store } from '../../models/store.js';
import { ECONOMY_CONFIG } from '../../config/economyConfig.js';
import { getAdProvider } from './adProviderAdapter.js';

export class RewardedAdService {
  // Step 1: Create an Ad Opportunity
  static createOpportunity(userId, { sessionId, missionId, placementType }) {
    if (!ECONOMY_CONFIG.rewardedAds.enabled) {
      throw new Error('Rewarded ads are currently disabled');
    }

    // Validate Daily Cap
    const dailyCount = store.getUserDailyAdCount(userId);
    if (dailyCount >= ECONOMY_CONFIG.rewardedAds.maxRewardedAdsPerDay) {
      throw new Error(`Daily rewarded ad limit reached (${ECONOMY_CONFIG.rewardedAds.maxRewardedAdsPerDay}/day)`);
    }

    // Validate Placement specific rules
    if (sessionId) {
      const session = store.getSession(sessionId);
      if (!session) throw new Error('Game session not found');
      if (session.userId !== userId) throw new Error('Session ownership mismatch');

      if (placementType === 'REVIVE') {
        if (!ECONOMY_CONFIG.rewardedAds.reviveEnabled) throw new Error('Revive ads are disabled');
        if (session.revivesUsed >= ECONOMY_CONFIG.rewardedAds.maxRevivesPerMission) {
          throw new Error('Maximum revives already reached for this mission');
        }
      } else if (placementType === 'DOUBLE_SCORE') {
        if (!ECONOMY_CONFIG.rewardedAds.doubleScoreEnabled) throw new Error('Double score ads disabled');
        if (session.doubleScoreClaimed) throw new Error('Double score already claimed for this session');
      } else if (placementType === 'DOUBLE_CREDITS') {
        if (!ECONOMY_CONFIG.rewardedAds.doubleCreditsEnabled) throw new Error('Double credits ads disabled');
        if (session.doubleCreditsClaimed) throw new Error('Double credits already claimed for this session');
      }
    }

    const opportunity = store.createAdOpportunity({
      userId,
      sessionId,
      missionId,
      placementType,
      provider: getAdProvider().name
    });

    store.recordEvent('ad_opportunity_created', {
      userId,
      opportunityId: opportunity.opportunityId,
      placementType
    });

    return opportunity;
  }

  // Step 2: Transition State (e.g. REQUESTED, AD_STARTED, AD_COMPLETED)
  static updateOpportunityState(opportunityId, nextStatus, metadata = {}) {
    const opp = store.getAdOpportunity(opportunityId);
    if (!opp) throw new Error('Ad opportunity not found');

    if (Date.now() > opp.expirationTime) {
      store.updateAdOpportunity(opportunityId, { status: 'EXPIRED' });
      throw new Error('Ad opportunity has expired');
    }

    const validTransitions = {
      'OFFERED': ['REQUESTED', 'EXPIRED'],
      'REQUESTED': ['AD_STARTED', 'REJECTED', 'EXPIRED'],
      'AD_STARTED': ['AD_COMPLETED', 'REJECTED', 'EXPIRED'],
      'AD_COMPLETED': ['VERIFYING', 'REJECTED'],
      'VERIFYING': ['VERIFIED', 'REJECTED'],
      'VERIFIED': ['GRANTED'],
      'REJECTED': [],
      'GRANTED': [],
      'EXPIRED': []
    };

    const allowed = validTransitions[opp.status] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Invalid state transition from ${opp.status} to ${nextStatus}`);
    }

    const updated = store.updateAdOpportunity(opportunityId, {
      status: nextStatus,
      ...metadata,
      updatedAt: new Date().toISOString()
    });

    store.recordEvent(`ad_${nextStatus.toLowerCase()}`, {
      opportunityId,
      status: nextStatus
    });

    return updated;
  }

  // Step 3: Verify with Provider & Grant Reward Atomically (Idempotent)
  static async verifyAndGrantReward(userId, opportunityId, { simulatedOutcome = 'COMPLETED', watchDurationSeconds = 5 } = {}) {
    const opp = store.getAdOpportunity(opportunityId);
    if (!opp) throw new Error('Ad opportunity not found');
    if (opp.userId !== userId) throw new Error('Ad opportunity user mismatch');

    // Idempotency check: If already granted, return current record without duplicating reward
    if (opp.status === 'GRANTED') {
      return {
        success: true,
        alreadyProcessed: true,
        message: 'Reward has already been granted for this ad opportunity.',
        opportunity: opp
      };
    }

    if (opp.status === 'EXPIRED') {
      throw new Error('Cannot verify an expired ad opportunity');
    }

    // Call Provider Abstraction
    const provider = getAdProvider();
    const verification = await provider.verifyAdCompletion(opp.uniqueEventIdentifier, {
      simulatedOutcome,
      watchDurationSeconds
    });

    if (!verification.verified) {
      store.updateAdOpportunity(opportunityId, {
        status: 'REJECTED',
        rejectionReason: verification.reason
      });
      store.recordEvent('reward_rejected', {
        opportunityId,
        reason: verification.reason
      });
      throw new Error(`Ad verification failed: ${verification.reason}`);
    }

    // Idempotency check on global keys
    const idempotencyKey = `ad-grant-${opp.uniqueEventIdentifier}`;
    if (store.hasIdempotencyKey(idempotencyKey)) {
      throw new Error('Duplicate ad event processed. Reward already committed.');
    }
    store.addIdempotencyKey(idempotencyKey);

    // Apply specific placement reward
    let grantResult = {};
    if (opp.placementType === 'REVIVE') {
      const session = store.getSession(opp.gameSessionId);
      if (!session) throw new Error('Session not found for revive');
      session.revivesUsed += 1;
      grantResult = {
        type: 'REVIVE',
        reviveGranted: true,
        checkpointWave: session.checkpointState.wave
      };
      store.recordEvent('revive_completed', { sessionId: session.sessionId, userId });
    } else if (opp.placementType === 'DOUBLE_SCORE') {
      const session = store.getSession(opp.gameSessionId);
      if (!session) throw new Error('Session not found');
      session.doubleScoreClaimed = true;
      session.stats.score *= ECONOMY_CONFIG.doubleScoreMultiplier;
      grantResult = {
        type: 'DOUBLE_SCORE',
        newScore: session.stats.score
      };
      store.recordEvent('double_score_completed', { sessionId: session.sessionId, score: session.stats.score });
    } else if (opp.placementType === 'DOUBLE_CREDITS') {
      const session = store.getSession(opp.gameSessionId);
      if (!session) throw new Error('Session not found');
      session.doubleCreditsClaimed = true;
      const bonusCredits = session.eligibleCredits;
      // Atomically deposit bonus credits to wallet
      const walletTx = store.modifyCurrencyAtomically(userId, 'credits', bonusCredits, {
        source: 'AD_REWARD',
        referenceId: opp.opportunityId,
        transactionType: 'AD_REWARD'
      });
      grantResult = {
        type: 'DOUBLE_CREDITS',
        bonusCredits,
        newBalance: walletTx.profile.credits
      };
      store.recordEvent('double_credits_completed', { sessionId: session.sessionId, bonusCredits });
    } else if (opp.placementType === 'POWER_UP') {
      // Grant a complimentary Shield Pulse power-up
      const profile = store.getProfile(userId);
      profile.powerUpInventory['shield_pulse'] = (profile.powerUpInventory['shield_pulse'] || 0) + 1;
      store.updateProfile(userId, profile);
      grantResult = {
        type: 'POWER_UP',
        itemGranted: 'shield_pulse',
        inventoryCount: profile.powerUpInventory['shield_pulse']
      };
    } else if (opp.placementType === 'DAILY_BONUS') {
      const bonusCredits = 100;
      const walletTx = store.modifyCurrencyAtomically(userId, 'credits', bonusCredits, {
        source: 'AD_REWARD',
        referenceId: opp.opportunityId,
        transactionType: 'DAILY_BONUS'
      });
      grantResult = {
        type: 'DAILY_BONUS',
        bonusCredits,
        newBalance: walletTx.profile.credits
      };
    }

    // Finalize state to GRANTED
    const grantedOpp = store.updateAdOpportunity(opportunityId, {
      status: 'GRANTED',
      completedAt: new Date().toISOString()
    });

    // Record authoritative Reward Transaction
    store.recordRewardTransaction({
      userId,
      sessionId: opp.gameSessionId,
      missionId: opp.missionId,
      rewardType: opp.placementType,
      amount: grantResult.bonusCredits || 1,
      multiplier: opp.placementType.includes('DOUBLE') ? 2 : 1,
      source: 'REWARDED_AD',
      adProvider: opp.provider,
      adEventId: opp.uniqueEventIdentifier,
      verificationStatus: 'VERIFIED'
    });

    store.recordEvent('reward_granted', {
      userId,
      opportunityId,
      placementType: opp.placementType
    });

    return {
      success: true,
      opportunity: grantedOpp,
      grantResult
    };
  }
}

