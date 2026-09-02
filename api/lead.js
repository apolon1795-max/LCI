const DEFAULT_YANDEX_LEAD_ENDPOINT = 'https://functions.yandexcloud.net/d4e51tqievk2k0540r71';
const DEFAULT_PUBLIC_ORIGIN = 'https://lci-drab.vercel.app';
const UPSTREAM_TIMEOUT_MS = 20_000;
const MAX_BODY_LENGTH = 50_000;

function firstHeader(value) {
  return Array.isArray(value) ? value[0] : value;
}

function serverConfig() {
  return {
    endpoint: process.env.YANDEX_LEAD_ENDPOINT?.trim() || DEFAULT_YANDEX_LEAD_ENDPOINT,
    origin: process.env.LCI_PUBLIC_ORIGIN?.trim() || DEFAULT_PUBLIC_ORIGIN,
  };
}

function parseBody(body) {
  if (body && typeof body === 'object' && !Array.isArray(body)) return body;
  if (typeof body !== 'string') return null;

  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'method-not-allowed' });
  }

  const body = parseBody(request.body);
  if (!body) return response.status(400).json({ error: 'invalid-json' });

  const serializedBody = JSON.stringify(body);
  if (serializedBody.length > MAX_BODY_LENGTH) {
    return response.status(413).json({ error: 'payload-too-large' });
  }

  const requestLeadId = firstHeader(request.headers?.['x-lead-id'])?.trim();
  if (requestLeadId && requestLeadId !== body.leadId) {
    return response.status(400).json({ error: 'lead-id-mismatch' });
  }

  try {
    const config = serverConfig();
    const upstream = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: config.origin,
        ...(requestLeadId ? { 'X-Lead-Id': requestLeadId } : {}),
      },
      body: serializedBody,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const upstreamBody = await upstream.json().catch(() => null);

    if (!upstreamBody || typeof upstreamBody !== 'object') {
      return response.status(502).json({ error: 'invalid-upstream-response' });
    }

    return response.status(upstream.status).json(upstreamBody);
  } catch (error) {
    return response.status(error instanceof Error && error.name === 'TimeoutError' ? 504 : 502).json({
      error: error instanceof Error && error.name === 'TimeoutError'
        ? 'upstream-timeout'
        : 'upstream-unavailable',
    });
  }
}
