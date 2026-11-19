// Centralized Authoritative Server Economy & Ads Configuration
// Values can be configured via environment variables or modified live via admin API
import dotenv from 'dotenv';
dotenv.config();

export const ECONOMY_CONFIG = {
  // Gameplay Base Rewards
  missionCompletionCredits: Number(process.env.MISSION_COMPLETION_CREDITS) || 100,
  normalEnemyCredits: Number(process.env.NORMAL_ENEMY_CREDITS) || 2,
  eliteEnemyCredits: Number(process.env.ELITE_ENEMY_CREDITS) || 10,
  bossCompletionCredits: Number(process.env.BOSS_COMPLETION_CREDITS) || 250,
  threeStarBonusCredits: Number(process.env.THREE_STAR_BONUS_CREDITS) || 50,
  dailyMissionCredits: Number(process.env.DAILY_MISSION_CREDITS) || 150,
  
  // Progression & Energy Cores
  bossCompletionCores: Number(process.env.BOSS_COMPLETION_CORES) || 1,
  sectorCompletionCores: Number(process.env.SECTOR_COMPLETION_CORES) || 3,

  // Multipliers
  doubleScoreMultiplier: Number(process.env.DOUBLE_SCORE_MULTIPLIER) || 2.0,
  doubleCreditsMultiplier: Number(process.env.DOUBLE_CREDITS_MULTIPLIER) || 2.0,

  // Rewarded Ads Management & Frequency Controls
  rewardedAds: {
    enabled: process.env.ADS_ENABLED !== 'false',
    provider: process.env.AD_PROVIDER || 'simulated_provider',
    reviveEnabled: process.env.AD_REVIVE_ENABLED !== 'false',
    doubleScoreEnabled: process.env.AD_DOUBLE_SCORE_ENABLED !== 'false',
    doubleCreditsEnabled: process.env.AD_DOUBLE_CREDITS_ENABLED !== 'false',
    extraShieldEnabled: process.env.AD_EXTRA_SHIELD_ENABLED !== 'false',
    
    // Per mission / session caps
    maxRevivesPerMission: Number(process.env.MAX_REVIVES_PER_MISSION) || 1,
    maxDoubleScorePerMission: Number(process.env.MAX_DOUBLE_SCORE_PER_MISSION) || 1,
    maxDoubleCreditsPerMission: Number(process.env.MAX_DOUBLE_CREDITS_PER_MISSION) || 1,
    
    // Global frequency & rate caps
    maxRewardedAdsPerSession: Number(process.env.MAX_REWARDED_ADS_PER_SESSION) || 5,
    maxRewardedPerHour: Number(process.env.MAX_REWARDED_PER_HOUR) || 8,
    maxRewardedAdsPerDay: Number(process.env.MAX_REWARDED_ADS_PER_DAY) || 10,
    minSecondsBetweenRewardedAds: Number(process.env.MIN_SECONDS_BETWEEN_REWARDED_ADS) || 30, // Cooldown in seconds
    opportunityExpirySeconds: Number(process.env.AD_OPPORTUNITY_EXPIRY_SECONDS) || 120    // Claim validity window in seconds
  },

  // Initial Player Grants
  initialPlayerGrant: {
    credits: Number(process.env.INITIAL_PLAYER_CREDITS) || 500,
    energyCores: Number(process.env.INITIAL_PLAYER_CORES) || 2,
    xp: 0,
    level: 1,
    platformRewardCoins: 0,
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
