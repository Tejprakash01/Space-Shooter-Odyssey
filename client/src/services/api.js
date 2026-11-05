// Client REST API Service Layer
import { API_URL } from '../config/gameConfig.js';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('odyssey_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('odyssey_token', token);
    } else {
      localStorage.removeItem('odyssey_token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: { ...this.getHeaders(), ...(options.headers || {}) }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // Auth
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async register(username, email, password) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Player & Wallet
  async getProfile() {
    return this.request('/player/profile');
  }

  async getWalletBalance() {
    return this.request('/wallet/balance');
  }

  async getWalletHistory() {
    return this.request('/wallet/history');
  }

  // Missions & Game Sessions
  async getMissions() {
    return this.request('/missions');
  }

  async getMission(missionId) {
    return this.request(`/missions/${missionId}`);
  }

  async startGame(missionId, shipId) {
    return this.request('/games/start', {
      method: 'POST',
      body: JSON.stringify({ missionId, shipId })
    });
  }

  async completeGame(sessionId, telemetry) {
    return this.request(`/games/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(telemetry)
    });
  }

  async claimRewards(sessionId) {
    return this.request(`/games/${sessionId}/claim`, {
      method: 'POST'
    });
  }

  // Ships & Hangar
  async getShips() {
    return this.request('/ships');
  }

  async selectShip(shipId) {
    return this.request(`/ships/${shipId}/select`, { method: 'POST' });
  }

  async upgradeShip(shipId, attributeName) {
    return this.request(`/ships/${shipId}/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ attributeName })
    });
  }

  async unlockShip(shipId) {
    return this.request(`/ships/${shipId}/unlock`, { method: 'POST' });
  }

  // Power-Ups
  async getPowerUps() {
    return this.request('/powerups');
  }

  async acquirePowerUp(powerUpId, quantity = 1) {
    return this.request(`/powerups/${powerUpId}/acquire`, {
      method: 'POST',
      body: JSON.stringify({ quantity })
    });
  }

  async usePowerUp(sessionId, powerUpId) {
    return this.request(`/games/${sessionId}/powerups/use`, {
      method: 'POST',
      body: JSON.stringify({ powerUpId })
    });
  }

  // Rewarded Ads
  async createAdOpportunity(placementType, sessionId = null, missionId = null) {
    return this.request('/rewards/ad/opportunity', {
      method: 'POST',
      body: JSON.stringify({ placementType, sessionId, missionId })
    });
  }

  async verifyAd(opportunityId, simulatedOutcome = 'COMPLETED', watchDurationSeconds = 5) {
    return this.request('/rewards/ad/verify', {
      method: 'POST',
      body: JSON.stringify({ opportunityId, simulatedOutcome, watchDurationSeconds })
    });
  }

  // Engagement
  async getDailyMissions() {
    return this.request('/daily-missions');
  }

  async claimDailyMission(missionId) {
    return this.request(`/daily-missions/${missionId}/claim`, { method: 'POST' });
  }

  async getDailyStreak() {
    return this.request('/daily-streak');
  }

  async claimDailyStreak() {
    return this.request('/daily-streak/claim', { method: 'POST' });
  }

  async claimSupplyDrop() {
    return this.request('/supply-drop/claim', { method: 'POST' });
  }

  async getAchievements() {
    return this.request('/achievements');
  }

  async getLeaderboard() {
    return this.request('/leaderboard');
  }

  async getEvents() {
    return this.request('/events');
  }

  // Admin
  async getAdminMetrics() {
    return this.request('/admin/metrics');
  }

  async getAdminTransactions() {
    return this.request('/admin/transactions');
  }
}

export const api = new ApiService();

