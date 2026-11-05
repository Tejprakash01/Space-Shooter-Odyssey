// Authoritative Game Session Lifecycle & Validation (PDF Part II & X, Sections 20, 64-66)
import { store } from '../../models/store.js';
import { MISSIONS_DATA } from '../../data/missionsData.js';
import { BOSSES_DATA } from '../../data/bossesData.js';
import { ECONOMY_CONFIG } from '../../config/economyConfig.js';

export class GameSessionService {
  // 1. Session Initialization
  static startSession(userId, { missionId, shipId }) {
    const profile = store.getProfile(userId);
    if (!profile) throw new Error('Player profile not found');

    const mission = MISSIONS_DATA.find(m => m.id === missionId);
    if (!mission) throw new Error('Mission not found');

    // Anti-Cheat: Validate that the mission is actually unlocked for this user
    if (!profile.unlockedMissions.includes(missionId)) {
      throw new Error(`Mission ${missionId} is locked. Complete previous campaign missions first.`);
    }

    // Validate ship ownership
    if (!profile.unlockedShips.includes(shipId)) {
      throw new Error(`Ship ${shipId} is not owned by this player.`);
    }

    const session = store.createSession({ userId, missionId, shipId });

    store.recordEvent('mission_started', {
      userId,
      sessionId: session.sessionId,
      missionId,
      shipId
    });

    return session;
  }

  // 2. Mission Completion & Anti-Cheat Validation
  static completeSession(userId, sessionId, telemetry) {
    const session = store.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.userId !== userId) throw new Error('Session ownership mismatch');
    if (session.status !== 'active') throw new Error(`Cannot complete session with status: ${session.status}`);

    const mission = MISSIONS_DATA.find(m => m.id === session.missionId);
    if (!mission) throw new Error('Mission data missing');

    const now = Date.now();
    const durationSeconds = Math.max(1, (now - session.startTime) / 1000);

    // Anti-Cheat Protection 1: Impossible completion speed
    // If mission requires killing 15 enemies or surviving 45 seconds, completing in 2 seconds is fraudulent
    if (mission.objective.type === 'survive_time' && durationSeconds < mission.objective.durationSeconds * 0.85) {
      throw new Error('Anti-cheat triggered: Mission duration shorter than required survival duration');
    }
    if (durationSeconds < 6.0) {
      throw new Error('Anti-cheat triggered: Run duration impossibly fast');
    }

    // Anti-Cheat Protection 2: Score bounds sanity check
    const claimedScore = Number(telemetry.score) || 0;
    const maxReasonableScore = 500000;
    if (claimedScore < 0 || claimedScore > maxReasonableScore) {
      throw new Error('Anti-cheat triggered: Score exceeds allowable statistical threshold');
    }

    // Update Session Telemetry
    session.status = telemetry.won ? 'completed' : 'failed';
    session.endTime = now;
    session.durationSeconds = Math.round(durationSeconds);
    session.stats.score = claimedScore;
    session.stats.enemiesDefeated = Number(telemetry.enemiesDefeated) || 0;
    session.stats.bossesDefeated = Number(telemetry.bossesDefeated) || 0;
    session.stats.damageTaken = Number(telemetry.damageTaken) || 0;
    session.stats.shotsFired = Number(telemetry.shotsFired) || 0;
    session.stats.shotsHit = Number(telemetry.shotsHit) || 0;
    session.stats.powerUpsUsed = telemetry.powerUpsUsed || [];

    // Calculate Stars
    let stars = 0;
    if (telemetry.won) {
      stars = 1; // Completed mission
      const healthPct = telemetry.healthRemainingPct || 100;
      if (healthPct >= 60) stars = 2;
      if (healthPct >= 80 && session.revivesUsed === 0) stars = 3;
    }
    session.finalStars = stars;

    // Authoritative Reward Calculation (Not client-driven)
    let eligibleCredits = 0;
    let eligibleXP = 0;
    let eligibleCores = 0;

    if (telemetry.won) {
      eligibleCredits = mission.rewards.credits + (stars === 3 ? ECONOMY_CONFIG.threeStarBonusCredits : 0);
      eligibleXP = mission.rewards.xp;
      eligibleCores = mission.rewards.cores || 0;
    } else {
      // Small consolidation reward for effort
      eligibleCredits = Math.min(25, session.stats.enemiesDefeated * ECONOMY_CONFIG.normalEnemyCredits);
      eligibleXP = Math.min(15, session.stats.enemiesDefeated * 2);
    }

    session.eligibleCredits = eligibleCredits;
    session.eligibleXP = eligibleXP;
    session.eligibleCores = eligibleCores;

    store.updateSession(sessionId, session);

    store.recordEvent(telemetry.won ? 'mission_completed' : 'mission_failed', {
      userId,
      sessionId,
      missionId: mission.id,
      score: claimedScore,
      stars,
      durationSeconds: session.durationSeconds
    });

    return {
      session,
      stars,
      eligibleCredits,
      eligibleXP,
      eligibleCores
    };
  }

  // 3. Claim Mission Rewards (Idempotent Transaction)
  static claimMissionRewards(userId, sessionId) {
    const session = store.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.userId !== userId) throw new Error('Session ownership mismatch');

    if (session.rewardsGranted) {
      throw new Error('Rewards have already been claimed for this session');
    }

    if (session.status !== 'completed' && session.status !== 'failed') {
      throw new Error('Session has not concluded yet');
    }

    const idempotencyKey = `claim-session-${sessionId}`;
    if (store.hasIdempotencyKey(idempotencyKey)) {
      throw new Error('Reward transaction already committed for this session');
    }
    store.addIdempotencyKey(idempotencyKey);

    const profile = store.getProfile(userId);
    const mission = MISSIONS_DATA.find(m => m.id === session.missionId);

    // Atomic Wallet Deposit
    if (session.eligibleCredits > 0) {
      store.modifyCurrencyAtomically(userId, 'credits', session.eligibleCredits, {
        source: 'MISSION_REWARD',
        referenceId: sessionId,
        transactionType: 'MISSION_REWARD'
      });
    }

    if (session.eligibleCores > 0) {
      store.modifyCurrencyAtomically(userId, 'energyCores', session.eligibleCores, {
        source: 'MISSION_REWARD',
        referenceId: sessionId,
        transactionType: 'MISSION_REWARD'
      });
    }

    // Update XP and Level Up progression (Section 55)
    if (session.eligibleXP > 0) {
      profile.xp += session.eligibleXP;
      const xpNeeded = profile.level * 250;
      if (profile.xp >= xpNeeded) {
        profile.level += 1;
        profile.xp -= xpNeeded;
        // Milestone reward for leveling up
        profile.credits += 200;
        store.recordEvent('player_level_up', { userId, newLevel: profile.level });
      }
    }

    // Save Progression
    if (session.status === 'completed') {
      if (!profile.completedMissions.includes(mission.id)) {
        profile.completedMissions.push(mission.id);
      }
      // Update star ratings
      const currentStars = profile.missionStars[mission.id] || 0;
      if (session.finalStars > currentStars) {
        profile.missionStars[mission.id] = session.finalStars;
      }
      // Update high score
      const currentBest = profile.highScores[mission.id] || 0;
      if (session.stats.score > currentBest) {
        profile.highScores[mission.id] = session.stats.score;
      }

      // Unlock Next Mission in sequence
      const nextSequence = mission.sequence + 1;
      const nextMission = MISSIONS_DATA.find(m => m.sequence === nextSequence);
      if (nextMission && !profile.unlockedMissions.includes(nextMission.id)) {
        profile.unlockedMissions.push(nextMission.id);
      }
    }

    store.updateProfile(userId, profile);
    session.rewardsGranted = true;
    store.updateSession(sessionId, session);

    return {
      success: true,
      creditsClaimed: session.eligibleCredits,
      xpClaimed: session.eligibleXP,
      coresClaimed: session.eligibleCores,
      newBalances: {
        credits: profile.credits,
        energyCores: profile.energyCores,
        xp: profile.xp,
        level: profile.level
      },
      unlockedMissions: profile.unlockedMissions
    };
  }
}

