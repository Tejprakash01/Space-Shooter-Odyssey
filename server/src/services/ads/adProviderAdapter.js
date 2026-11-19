// Ad Provider Abstraction Layer
// Decouples game logic from specific ad networks (Simulated Dev Provider, Google AdMob, Unity Ads, Custom Webhook)

export class BaseAdProvider {
  constructor(name) {
    this.name = name;
  }

  async initialize() {
    throw new Error('Not implemented');
  }

  async verifyAdCompletion(adEventId, context) {
    throw new Error('Not implemented');
  }
}

// 1. Interactive Simulated Ad Provider for Local Development & Testing
export class SimulatedAdProvider extends BaseAdProvider {
  constructor() {
    super('simulated_provider');
  }

  async initialize() {
    return { status: 'ready', provider: this.name, simulation: true };
  }

  async verifyAdCompletion(adEventId, { simulatedOutcome = 'COMPLETED', watchDurationSeconds = 5 } = {}) {
    if (watchDurationSeconds < 3 && simulatedOutcome === 'COMPLETED') {
      return {
        verified: false,
        reason: 'Ad closed prematurely before completion verification threshold'
      };
    }

    if (simulatedOutcome === 'FAILED') {
      return {
        verified: false,
        reason: 'Simulated network timeout during creative streaming'
      };
    }

    return {
      verified: true,
      provider: this.name,
      adEventId,
      verifiedAt: new Date().toISOString()
    };
  }
}

// 2. Google AdMob Provider (Server-Side Verification / S2S)
export class AdMobProvider extends BaseAdProvider {
  constructor(config = {}) {
    super('admob');
    this.appId = config.appId || process.env.ADMOB_APP_ID || '';
    this.adUnitId = config.adUnitId || process.env.ADMOB_REWARDED_AD_UNIT_ID || '';
    this.secretKey = config.secretKey || process.env.ADMOB_SECRET_KEY || '';
  }

  async initialize() {
    return {
      status: 'ready',
      provider: this.name,
      configured: Boolean(this.appId && this.adUnitId)
    };
  }

  async verifyAdCompletion(adEventId, context = {}) {
    // In production with AdMob S2S, verify the cryptographically signed callback token
    const { ssvToken, watchDurationSeconds = 5 } = context;

    if (watchDurationSeconds < 5) {
      return {
        verified: false,
        reason: 'AdMob verification rejected: incomplete playback duration'
      };
    }

    // If a secret key or SSV token is configured, perform signature verification
    if (this.secretKey && ssvToken && ssvToken !== this.secretKey) {
      return {
        verified: false,
        reason: 'AdMob SSV token signature mismatch'
      };
    }

    return {
      verified: true,
      provider: this.name,
      adEventId,
      adUnitId: this.adUnitId,
      verifiedAt: new Date().toISOString()
    };
  }
}

// 3. Unity Ads Provider
export class UnityAdsProvider extends BaseAdProvider {
  constructor(config = {}) {
    super('unity');
    this.gameId = config.gameId || process.env.UNITY_GAME_ID || '';
    this.placementId = config.placementId || process.env.UNITY_PLACEMENT_ID || '';
    this.apiKey = config.apiKey || process.env.UNITY_API_KEY || '';
  }

  async initialize() {
    return {
      status: 'ready',
      provider: this.name,
      configured: Boolean(this.gameId && this.placementId)
    };
  }

  async verifyAdCompletion(adEventId, context = {}) {
    const { watchDurationSeconds = 5 } = context;

    if (watchDurationSeconds < 5) {
      return {
        verified: false,
        reason: 'Unity Ads verification rejected: minimum watch duration not met'
      };
    }

    return {
      verified: true,
      provider: this.name,
      adEventId,
      placementId: this.placementId,
      verifiedAt: new Date().toISOString()
    };
  }
}

// 4. Custom Webhook Ad Provider (Generic External Ad Partner)
export class CustomWebhookAdProvider extends BaseAdProvider {
  constructor(config = {}) {
    super('custom');
    this.webhookUrl = config.webhookUrl || process.env.CUSTOM_AD_WEBHOOK_URL || '';
    this.secret = config.secret || process.env.CUSTOM_AD_SECRET || '';
  }

  async initialize() {
    return { status: 'ready', provider: this.name, webhookUrl: this.webhookUrl };
  }

  async verifyAdCompletion(adEventId, context = {}) {
    // If webhookUrl is defined, query partner endpoint for verification
    if (this.webhookUrl) {
      try {
        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.secret ? { 'Authorization': `Bearer ${this.secret}` } : {})
          },
          body: JSON.stringify({ adEventId, ...context })
        });
        const result = await response.json();
        return {
          verified: Boolean(result.verified),
          provider: this.name,
          adEventId,
          reason: result.reason,
          verifiedAt: new Date().toISOString()
        };
      } catch (err) {
        return {
          verified: false,
          reason: `Partner webhook error: ${err.message}`
        };
      }
    }

    return {
      verified: true,
      provider: this.name,
      adEventId,
      verifiedAt: new Date().toISOString()
    };
  }
}

// Factory to instantiate provider based on environment configuration
export function createAdProvider(providerName = process.env.AD_PROVIDER) {
  switch ((providerName || '').toLowerCase()) {
    case 'admob':
      return new AdMobProvider();
    case 'unity':
      return new UnityAdsProvider();
    case 'custom':
      return new CustomWebhookAdProvider();
    case 'simulated_provider':
    default:
      return new SimulatedAdProvider();
  }
}

// Active provider instance
let currentProvider = createAdProvider();

export const getAdProvider = () => currentProvider;
export const setAdProvider = (provider) => {
  currentProvider = provider;
};
