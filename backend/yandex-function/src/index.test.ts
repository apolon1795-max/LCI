import assert from 'node:assert/strict';
import test from 'node:test';
import { handler } from './index.js';
import { makeValidLead } from './test-fixture.js';

const ORIGIN = 'http://localhost:3000';

test('stores a lead and returns the same receipt on an idempotent retry', async () => {
  process.env.LEAD_STORAGE_MODE = 'memory';
  process.env.ALLOWED_ORIGINS = ORIGIN;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;
  delete process.env.SMTP_HOST;
  delete process.env.EMAIL_TO;

  const lead = makeValidLead();
  const event = {
    httpMethod: 'POST',
    headers: { origin: ORIGIN, 'x-lead-id': lead.leadId },
    body: JSON.stringify(lead),
  };

  const first = await handler(event);
  assert.equal(first.statusCode, 201);
  const firstBody = JSON.parse(first.body) as Record<string, unknown>;
  assert.equal(firstBody.stored, true);
  assert.match(String(firstBody.giftCode), /^LCI-[0-9A-F]{8}$/);
  assert.deepEqual(firstBody.notifications, { telegram: 'skipped', email: 'skipped' });

  const retry = await handler(event);
  assert.equal(retry.statusCode, 200);
  const retryBody = JSON.parse(retry.body) as Record<string, unknown>;
  assert.equal(retryBody.duplicate, true);
  assert.equal(retryBody.giftCode, firstBody.giftCode);
  assert.equal(retryBody.storedAt, firstBody.storedAt);
});

test('rejects a browser origin outside the allowlist', async () => {
  process.env.LEAD_STORAGE_MODE = 'memory';
  process.env.ALLOWED_ORIGINS = ORIGIN;
  const result = await handler({
    httpMethod: 'POST',
    headers: { origin: 'https://untrusted.example' },
    body: JSON.stringify(makeValidLead()),
  });
  assert.equal(result.statusCode, 403);
  assert.equal(result.headers['Access-Control-Allow-Origin'], undefined);
});

test('answers a CORS preflight for an allowed origin', async () => {
  process.env.LEAD_STORAGE_MODE = 'memory';
  process.env.ALLOWED_ORIGINS = ORIGIN;
  const result = await handler({ httpMethod: 'OPTIONS', headers: { origin: ORIGIN } });
  assert.equal(result.statusCode, 204);
  assert.equal(result.headers['Access-Control-Allow-Origin'], ORIGIN);
});
