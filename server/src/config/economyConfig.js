// Centralized Authoritative Server Economy Configuration (PDF Part VI, Sections 30-35)
export const ECONOMY_CONFIG = {
  // Gameplay Base Rewards
  missionCompletionCredits: 100,
  normalEnemyCredits: 2,
  eliteEnemyCredits: 10,
  bossCompletionCredits: 250,
  threeStarBonusCredits: 50,
  dailyMissionCredits: 150,
  
  // Progression & Energy Cores
  bossCompletionCores: 1,
  sectorCompletionCores: 3,

  // Multipliers
  doubleScoreMultiplier: 2.0,
  doubleCreditsMultiplier: 2.0,

  // Rewarded Ads Controls
  rewardedAds: {
    enabled: true,
    reviveEnabled: true,
    doubleScoreEnabled: true,
    doubleCreditsEnabled: true,
    extraShieldEnabled: true,
    
    // Per mission / session caps
    maxRevivesPerMission: 1,
    maxDoubleScorePerMission: 1,
    maxDoubleCreditsPerMission: 1,
    
    // Global frequency & rate caps
    maxRewardedAdsPerSession: 5,
    maxRewardedPerHour: 8,
    maxRewardedAdsPerDay: 10,
    minSecondsBetweenRewardedAds: 30, // Cooldown between ad triggers
    opportunityExpirySeconds: 120    // Ad opportunity must be claimed within 2 minutes
  },

  // Initial Player Grants
  initialPlayerGrant: {
    credits: 500,
    energyCores: 2,
    xp: 0,
    level: 1,
    veloopRewardCoins: 0,
    unlockedShips: ['interceptor'],
    selectedShip: 'interceptor',
    unlockedMissions: ['mission-01']
  },

  // Upgrade Costs & Scaling Formulas
  upgradeConfig: {
    maxAttributeLevel: 5,
    baseCreditCost: 150,
    coreCostLevelThreshold: 4, // Upgrades to level 4 and 5 require 1 Energy Core
    costMultiplier: 1.6
  }
};
