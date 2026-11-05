import request from 'supertest';
import app from '../src/server.js';
import { GAME_NAME } from '../src/config/gameConfig.js';

describe('Authoritative Economy, Auth & Anti-Cheat Suite', () => {
  let authToken = '';
  let testUserId = '';

  it('Verifies dynamic Game Name health endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.gameName).toBe(GAME_NAME);
  });

  it('Registers pilot and receives JWT token with initial wallet grant', async () => {
    const testEmail = `cadet_${Date.now()}@odyssey.com`;
    const res = await request(app).post('/api/auth/register').send({
      username: 'CadetNova',
      email: testEmail,
      password: 'password123'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
    testUserId = res.body.user.id;
  });

  it('Enforces server-authoritative wallet balance checks', async () => {
    const res = await request(app)
      .get('/api/wallet/balance')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.balances.credits).toBeGreaterThanOrEqual(500);
  });

  it('Prevents spending more currency than owned (Anti-Cheat / Anti-Overdraft)', async () => {
    // Attempting to unlock an expensive ship without sufficient credits
    const res = await request(app)
      .post('/api/ships/experimental/unlock')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Insufficient/i);
  });

  it('Enforces Rewarded-Ad state machine and duplicate claim idempotency', async () => {
    // 1. Create ad opportunity
    const oppRes = await request(app)
      .post('/api/rewards/ad/opportunity')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ placementType: 'DAILY_BONUS' });

    expect(oppRes.status).toBe(201);
    const oppId = oppRes.body.opportunity.opportunityId;

    // 2. Claim verified reward
    const claimRes = await request(app)
      .post('/api/rewards/ad/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ opportunityId: oppId, simulatedOutcome: 'COMPLETED', watchDurationSeconds: 5 });

    expect(claimRes.status).toBe(200);
    expect(claimRes.body.success).toBe(true);

    // 3. Duplicate claim must NOT duplicate grant (Idempotency test)
    const dupRes = await request(app)
      .post('/api/rewards/ad/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ opportunityId: oppId, simulatedOutcome: 'COMPLETED', watchDurationSeconds: 5 });

    expect(dupRes.body.alreadyProcessed).toBe(true);
  });

  it('Anti-Cheat: Rejects impossibly fast mission completion times', async () => {
    // Start session
    const startRes = await request(app)
      .post('/api/games/start')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ missionId: 'mission-01', shipId: 'interceptor' });

    expect(startRes.status).toBe(201);
    const sessionId = startRes.body.sessionId;

    // Immediately submit completion within milliseconds
    const cheatRes = await request(app)
      .post(`/api/games/${sessionId}/complete`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ won: true, score: 99999, enemiesDefeated: 20 });

    expect(cheatRes.status).toBe(400);
    expect(cheatRes.body.message).toMatch(/Anti-cheat/i);
  });
});

