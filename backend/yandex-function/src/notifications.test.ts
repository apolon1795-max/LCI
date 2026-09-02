import assert from 'node:assert/strict';
import test from 'node:test';
import { deliverNotifications } from './notifications.js';
import { makeValidLead } from './test-fixture.js';

test('uses Telegram-compatible HTML with literal newlines', async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
    includeContacts: process.env.TELEGRAM_INCLUDE_CONTACTS,
  };

  process.env.TELEGRAM_BOT_TOKEN = 'test-token';
  process.env.TELEGRAM_CHAT_ID = '-100123';
  process.env.TELEGRAM_INCLUDE_CONTACTS = 'false';

  let requestBody: Record<string, unknown> | undefined;
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const lead = makeValidLead();
    lead.selections.branch.address = 'ул. Тестовая, 1 <корпус>';
    const statuses = await deliverNotifications(lead, 'LCI-1234ABCD');

    assert.equal(statuses.telegram, 'sent');
    assert.equal(statuses.email, 'skipped');
    assert.equal(requestBody?.parse_mode, 'HTML');
    assert.match(String(requestBody?.text), /Новая заявка LCI\nКод: LCI-1234ABCD/);
    assert.doesNotMatch(String(requestBody?.text), /<br\s*\/?>/i);
    assert.match(String(requestBody?.text), /&lt;корпус&gt;/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnv.token === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = originalEnv.token;
    if (originalEnv.chatId === undefined) delete process.env.TELEGRAM_CHAT_ID;
    else process.env.TELEGRAM_CHAT_ID = originalEnv.chatId;
    if (originalEnv.includeContacts === undefined) delete process.env.TELEGRAM_INCLUDE_CONTACTS;
    else process.env.TELEGRAM_INCLUDE_CONTACTS = originalEnv.includeContacts;
  }
});

