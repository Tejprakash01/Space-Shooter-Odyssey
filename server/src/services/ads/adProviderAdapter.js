// Ad Provider Abstraction Layer (PDF Part VII, Section 48)
// Decouples game logic from specific ad networks (AdMob, Unity, AppLovin, Simulated Dev Provider)

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

// Interactive Simulated Ad Provider for Local Development & Acceptance Testing
export class SimulatedAdProvider extends BaseAdProvider {
  constructor() {
    super('simulated_provider');
  }

  async initialize() {
    return { status: 'ready', provider: this.name, simulation: true };
  }

  async verifyAdCompletion(adEventId, { simulatedOutcome = 'COMPLETED', watchDurationSeconds = 5 } = {}) {
    // A simulated provider simulates network latency and verification
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

// Factory to select active provider
let currentProvider = new SimulatedAdProvider();

export const getAdProvider = () => currentProvider;
export const setAdProvider = (provider) => {
  currentProvider = provider;
};

