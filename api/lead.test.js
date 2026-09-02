import assert from 'node:assert/strict';
import test from 'node:test';
import handler from './lead.js';

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

test('accepts only POST requests', async () => {
  const response = makeResponse();
  await handler({ method: 'GET', headers: {} }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'POST');
});

test('forwards a lead to Yandex with the production origin', async () => {
  const originalFetch = globalThis.fetch;
  const lead = { schemaVersion: 1, leadId: 'test-lead' };
  let requestedUrl = '';
  let requestInit;

  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    requestInit = init;
    return new Response(JSON.stringify({ stored: true, leadId: lead.leadId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const response = makeResponse();
  try {
    await handler({
      method: 'POST',
      headers: { 'x-lead-id': lead.leadId },
      body: lead,
    }, response);
    assert.equal(requestedUrl, 'https://functions.yandexcloud.net/d4e51tqievk2k0540r71');
    assert.equal(new Headers(requestInit?.headers).get('Origin'), 'https://lci-drab.vercel.app');
    assert.equal(new Headers(requestInit?.headers).get('X-Lead-Id'), lead.leadId);
    assert.deepEqual(JSON.parse(String(requestInit?.body)), lead);
    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.payload, { stored: true, leadId: lead.leadId });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects a mismatched request lead id', async () => {
  const response = makeResponse();
  await handler({
    method: 'POST',
    headers: { 'x-lead-id': 'another-lead' },
    body: { schemaVersion: 1, leadId: 'test-lead' },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.payload, { error: 'lead-id-mismatch' });
});
