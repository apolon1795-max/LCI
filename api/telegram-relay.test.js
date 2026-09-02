import assert from 'node:assert/strict';
import test from 'node:test';
import handler from './telegram-relay.js';

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test('rejects requests without the relay secret', async () => {
  const originalSecret = process.env.TELEGRAM_RELAY_SECRET;
  process.env.TELEGRAM_RELAY_SECRET = 'expected-secret';
  const response = makeResponse();

  try {
    await handler({ method: 'POST', headers: {}, body: {} }, response);
    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.payload, { ok: false, error: 'unauthorized' });
  } finally {
    if (originalSecret === undefined) delete process.env.TELEGRAM_RELAY_SECRET;
    else process.env.TELEGRAM_RELAY_SECRET = originalSecret;
  }
});

test('forwards an authenticated message to Telegram', async () => {
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.TELEGRAM_RELAY_SECRET;
  process.env.TELEGRAM_RELAY_SECRET = 'expected-secret';

  let forwardedBody;
  globalThis.fetch = async (_input, init) => {
    forwardedBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const response = makeResponse();
  try {
    await handler({
      method: 'POST',
      headers: { 'x-lci-relay-secret': 'expected-secret' },
      body: {
        botToken: '123456789:test_token_abcdefghijklmnopqrstuvwxyz',
        chatId: '-100123',
        text: 'Новая заявка LCI',
      },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.payload, { ok: true });
    assert.deepEqual(forwardedBody, {
      chat_id: '-100123',
      text: 'Новая заявка LCI',
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.TELEGRAM_RELAY_SECRET;
    else process.env.TELEGRAM_RELAY_SECRET = originalSecret;
  }
});

