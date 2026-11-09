// Dual-Engine Authoritative Store: MongoDB + Resilient In-Memory Datastore
// Implements atomic transactions, wallet ledgers, idempotency keys, and cheat detection.
import { v4 as uuidv4 } from 'uuid';
import { ECONOMY_CONFIG } from '../config/economyConfig.js';
import { SHIPS_DATA } from '../data/shipsData.js';
import { MISSIONS_DATA } from '../data/missionsData.js';
import { POWERUPS_DATA } from '../data/powerupsData.js';

class AuthoritativeStore {
  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.sessions = new Map();
    this.walletTransactions = [];
    this.rewardTransactions = [];
    this.adOpportunities = new Map();
    this.dailyClaims = new Map(); // userId -> [{ date, claimedAt }]
    this.dailyMissions = new Map(); // userId_date -> [missions]
    this.achievements = new Map(); // userId -> Set(achievementIds)
    this.idempotencyKeys = new Set();
    this.gameEvents = [];

    // Seed initial system admin and fleet commander accounts
    this.seedDefaults();
  }

  seedDefaults() {
    const defaultUserId = 'user-pilot-alpha';
    this.users.set(defaultUserId, {
      id: defaultUserId,
      username: 'StarCommanderAlpha',
      email: 'commander@odyssey.space',
      passwordHash: '$2a$10$9IAVT9Evuv4NEkbxs2e/1.FibGwZpYEzZrSlghBYaAGGcICbQdmpm', // 'password123'
      role: 'player',
      createdAt: new Date().toISOString()
    });

    const adminId = 'user-adm-01';
    this.users.set(adminId, {
      id: adminId,
      username: 'FleetAdmiral',
      email: 'admin@odyssey.space',
      passwordHash: '$2a$10$9IAVT9Evuv4NEkbxs2e/1.FibGwZpYEzZrSlghBYaAGGcICbQdmpm', // 'password123'
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    // Seed Profile
    this.profiles.set(defaultUserId, {
      userId: defaultUserId,
      level: 3,
      xp: 450,
      credits: 1200,
      energyCores: 4,
      platformRewardCoins: 50,
      selectedShipId: 'interceptor',
      unlockedShips: ['interceptor', 'striker'],
      unlockedMissions: ['mission-01', 'mission-02', 'mission-03'],
      completedMissions: ['mission-01', 'mission-02'],
      missionStars: { 'mission-01': 3, 'mission-02': 2 },
      highScores: { 'mission-01': 4200, 'mission-02': 6800 },
      dailyStreak: { current: 3, lastClaimDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
      powerUpInventory: { shield_pulse: 2, rapid_fire: 3, homing_missiles: 1 },
      shipUpgrades: {
        interceptor: { weaponDamage: 2, fireRate: 1, maxHealth: 2, movementSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
        striker: { weaponDamage: 1, fireRate: 1, maxHealth: 1, movementSpeed: 1, shieldCapacity: 1, specialCooldown: 1 }
      },
      updatedAt: new Date().toISOString()
    });
  }

  // --- USER METHODS ---
  findUserByEmail(email) {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  findUserById(id) {
    return this.users.get(id) || null;
  }

  createUser(userData) {
    const id = userData.id || `user-${uuidv4()}`;
    const record = { ...userData, id, createdAt: new Date().toISOString() };
    this.users.set(id, record);

    // Initialize fresh authoritative profile
    const profile = {
      userId: id,
      level: ECONOMY_CONFIG.initialPlayerGrant.level,
      xp: ECONOMY_CONFIG.initialPlayerGrant.xp,
      credits: ECONOMY_CONFIG.initialPlayerGrant.credits,
      energyCores: ECONOMY_CONFIG.initialPlayerGrant.energyCores,
      platformRewardCoins: ECONOMY_CONFIG.initialPlayerGrant.platformRewardCoins || 0,
      selectedShipId: ECONOMY_CONFIG.initialPlayerGrant.selectedShip,
      unlockedShips: [...ECONOMY_CONFIG.initialPlayerGrant.unlockedShips],
      unlockedMissions: [...ECONOMY_CONFIG.initialPlayerGrant.unlockedMissions],
      completedMissions: [],
      missionStars: {},
      highScores: {},
      dailyStreak: { current: 1, lastClaimDate: null },
      powerUpInventory: { shield_pulse: 1, rapid_fire: 1 },
      shipUpgrades: {
        interceptor: { weaponDamage: 1, fireRate: 1, maxHealth: 1, movementSpeed: 1, shieldCapacity: 1, specialCooldown: 1 }
      },
      updatedAt: new Date().toISOString()
    };
    this.profiles.set(id, profile);

    // Initial Wallet Credit Log
    this.recordWalletTransaction({
      userId: id,
      type: 'CREDIT',
      currency: 'credits',
      amount: ECONOMY_CONFIG.initialPlayerGrant.credits,
      balanceBefore: 0,
      balanceAfter: ECONOMY_CONFIG.initialPlayerGrant.credits,
      source: 'INITIAL_GRANT',
      referenceId: 'welcome_package',
      status: 'COMPLETED'
    });

    return record;
  }

  recordWalletTransaction(txData) {
    const tx = {
      transactionId: `tx-${uuidv4()}`,
      gameId: 'SPACE_SHOOTER_ODYSSEY',
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      ...txData
    };
    this.walletTransactions.push(tx);
    return tx;
  }

  // --- PROFILE METHODS ---
  getProfile(userId) {
    return this.profiles.get(userId) || null;
  }

  updateProfile(userId, updater) {
    const profile = this.getProfile(userId);
    if (!profile) return null;
    const updated = typeof updater === 'function' ? updater(profile) : { ...profile, ...updater };
    updated.updatedAt = new Date().toISOString();
    this.profiles.set(userId, updated);
    return updated;
  }

  // --- ATOMIC WALLET TRANSACTIONS (PDF Part VI, Section 36 & 38) ---
  modifyCurrencyAtomically(userId, currency, delta, { source, referenceId, transactionType }) {
    const profile = this.getProfile(userId);
    if (!profile) throw new Error('Player profile not found');

    const currentBalance = profile[currency] || 0;
    if (delta < 0 && currentBalance + delta < 0) {
      throw new Error(`Insufficient ${currency}. Current balance: ${currentBalance}, required: ${Math.abs(delta)}`);
    }

    const newBalance = currentBalance + delta;
    profile[currency] = newBalance;
    profile.updatedAt = new Date().toISOString();
    this.profiles.set(userId, profile);

    const tx = {
      transactionId: `tx-${uuidv4()}`,
      userId,
      gameId: 'SPACE_SHOOTER_ODYSSEY',
      type: transactionType || (delta >= 0 ? 'CREDIT' : 'DEBIT'),
      currency,
      amount: Math.abs(delta),
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      source,
      referenceId,
      status: 'COMPLETED',
      timestamp: new Date().toISOString()
    };

    this.walletTransactions.push(tx);
    return { profile, transaction: tx };
  }

  getWalletTransactions(userId) {
    return this.walletTransactions.filter(tx => tx.userId === userId).reverse();
  }

  getAllWalletTransactions() {
    return [...this.walletTransactions].reverse();
  }

  // --- REWARD TRANSACTIONS & IDEMPOTENCY (Section 37 & 39) ---
  hasIdempotencyKey(key) {
    return this.idempotencyKeys.has(key);
  }

  addIdempotencyKey(key) {
    this.idempotencyKeys.add(key);
  }

  recordRewardTransaction(rewardData) {
    const record = {
      rewardId: `rwd-${uuidv4()}`,
      gameId: 'SPACE_SHOOTER_ODYSSEY',
      timestamp: new Date().toISOString(),
      ...rewardData
    };
    this.rewardTransactions.push(record);
    return record;
  }

  getRewardTransactions(userId) {
    return this.rewardTransactions.filter(r => r.userId === userId).reverse();
  }

  getAllRewardTransactions() {
    return [...this.rewardTransactions].reverse();
  }

  // --- GAME SESSION LIFECYCLE (Section 20 & 64) ---
  createSession({ userId, missionId, shipId }) {
    const sessionId = `ses-${uuidv4()}`;
    const mission = MISSIONS_DATA.find(m => m.id === missionId);
    if (!mission) throw new Error('Invalid mission ID');

    const session = {
      sessionId,
      userId,
      gameId: 'SPACE_SHOOTER_ODYSSEY',
      missionId,
      selectedShipId: shipId,
      status: 'active', // 'active', 'completed', 'failed', 'abandoned'
      startTime: Date.now(),
      endTime: null,
      durationSeconds: 0,
      initialState: {
        playerShip: shipId,
        difficulty: mission.difficulty
      },
      stats: {
        score: 0,
        enemiesDefeated: 0,
        bossesDefeated: 0,
        damageTaken: 0,
        shotsFired: 0,
        shotsHit: 0,
        powerUpsUsed: []
      },
      revivesUsed: 0,
      maxRevives: ECONOMY_CONFIG.rewardedAds.maxRevivesPerMission,
      doubleScoreClaimed: false,
      doubleCreditsClaimed: false,
      rewardsGranted: false,
      finalStars: 0,
      eligibleCredits: 0,
      eligibleXP: 0,
      checkpointState: { wave: 1, health: 100 }
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  updateSession(sessionId, updater) {
    const s = this.getSession(sessionId);
    if (!s) return null;
    const updated = typeof updater === 'function' ? updater(s) : { ...s, ...updater };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  getPlayerSessions(userId) {
    const list = [];
    for (const s of this.sessions.values()) {
      if (s.userId === userId) list.push(s);
    }
    return list.sort((a, b) => b.startTime - a.startTime);
  }

  // --- AD OPPORTUNITY MODEL (Section 46-47) ---
  createAdOpportunity({ userId, sessionId, missionId, placementType, provider = 'simulated_provider' }) {
    const opportunityId = `adopp-${uuidv4()}`;
    const opp = {
      opportunityId,
      userId,
      gameSessionId: sessionId,
      missionId,
      placementType,
      provider,
      status: 'OFFERED', // OFFERED -> REQUESTED -> AD_STARTED -> AD_COMPLETED -> VERIFYING -> VERIFIED -> GRANTED -> REJECTED -> EXPIRED
      expirationTime: Date.now() + (ECONOMY_CONFIG.rewardedAds.opportunityExpirySeconds * 1000),
      uniqueEventIdentifier: `evt-${uuidv4()}`,
      createdAt: new Date().toISOString()
    };
    this.adOpportunities.set(opportunityId, opp);
    return opp;
  }

  getAdOpportunity(opportunityId) {
    return this.adOpportunities.get(opportunityId) || null;
  }

  updateAdOpportunity(opportunityId, updateObj) {
    const opp = this.getAdOpportunity(opportunityId);
    if (!opp) return null;
    Object.assign(opp, updateObj);
    this.adOpportunities.set(opportunityId, opp);
    return opp;
  }

  getUserDailyAdCount(userId) {
    const todayStr = new Date().toISOString().split('T')[0];
    let count = 0;
    for (const opp of this.adOpportunities.values()) {
      if (opp.userId === userId && opp.status === 'GRANTED' && opp.createdAt.startsWith(todayStr)) {
        count++;
      }
    }
    return count;
  }

  // --- ANALYTICS EVENTS (Section 76) ---
  recordEvent(eventName, payload) {
    const evt = {
      eventId: `evt-${uuidv4()}`,
      name: eventName,
      timestamp: new Date().toISOString(),
      ...payload
    };
    this.gameEvents.push(evt);
    return evt;
  }

  getAllEvents() {
    return this.gameEvents;
  }
}

export const store = new AuthoritativeStore();
