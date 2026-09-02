import { makeGiftCode, RequestValidationError, validateLeadSubmission } from './domain.js';
import { deliverNotifications, NotificationStatuses } from './notifications.js';
import { withConfiguredStorage } from './storage.js';
import {
  CloudFunctionEvent,
  CloudFunctionResponse,
  LeadStorage,
  NotificationDelivery,
  PublicLeadReceipt,
  StoredLead,
} from './types.js';

const MAX_BODY_BYTES = 32 * 1_024;

function normalizeHeaders(headers: CloudFunctionEvent['headers']): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers ?? {})) {
    if (typeof value === 'string') result[key.toLowerCase()] = value;
  }
  return result;
}

function allowedOrigins(): Set<string> {
  const configured = process.env.ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
  if (process.env.LEAD_STORAGE_MODE === 'memory' && configured.length === 0) {
    configured.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }
  return new Set(configured);
}

function response(
  statusCode: number,
  body: Record<string, unknown> | null,
  origin?: string,
): CloudFunctionResponse {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Lead-Id';
    headers['Access-Control-Max-Age'] = '600';
  }
  return {
    statusCode,
    headers,
    body: body ? JSON.stringify(body) : '',
    isBase64Encoded: false,
  };
}

function parseBody(event: CloudFunctionEvent): unknown {
  if (event.body && typeof event.body === 'object') return event.body;
  const source = typeof event.body === 'string' ? event.body : '';
  const raw = event.isBase64Encoded ? Buffer.from(source, 'base64').toString('utf8') : source;
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    throw new RequestValidationError('Слишком большой запрос', 413);
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new RequestValidationError('Некорректный JSON', 400);
  }
}

function finalStatus(value: NotificationDelivery): NotificationStatuses['telegram'] {
  return value === 'pending' ? 'failed' : value;
}

function publicReceipt(lead: StoredLead, duplicate: boolean): PublicLeadReceipt {
  return {
    stored: true,
    leadId: lead.payload.leadId,
    giftCode: lead.giftCode,
    storedAt: lead.storedAt,
    duplicate,
    notifications: {
      telegram: finalStatus(lead.telegramStatus),
      email: finalStatus(lead.emailStatus),
    },
  };
}

async function storeAndNotify(storage: LeadStorage, rawBody: unknown, requestLeadId?: string): Promise<{
  receipt: PublicLeadReceipt;
  duplicate: boolean;
}> {
  const payload = validateLeadSubmission(rawBody);
  if (requestLeadId && requestLeadId !== payload.leadId) {
    throw new RequestValidationError('Идентификатор запроса не совпадает с заявкой', 400);
  }

  const storedAt = new Date().toISOString();
  const giftCode = makeGiftCode(payload.leadId);
  const result = await storage.insertOrGet(payload, storedAt, giftCode);
  const notificationWasFinal = result.lead.telegramStatus !== 'pending' && result.lead.emailStatus !== 'pending';
  if (result.duplicate && notificationWasFinal) {
    return { receipt: publicReceipt(result.lead, true), duplicate: true };
  }

  const statuses = await deliverNotifications(result.lead.payload, result.lead.giftCode);
  result.lead.telegramStatus = statuses.telegram;
  result.lead.emailStatus = statuses.email;
  try {
    await storage.updateNotificationStatus(result.lead.payload.leadId, statuses.telegram, statuses.email);
  } catch (error) {
    console.error('Lead stored, but notification status update failed', {
      error: error instanceof Error ? error.name : 'UnknownError',
      leadId: result.lead.payload.leadId,
    });
  }
  return { receipt: publicReceipt(result.lead, result.duplicate), duplicate: result.duplicate };
}

export async function handler(event: CloudFunctionEvent): Promise<CloudFunctionResponse> {
  const method = event.httpMethod?.toUpperCase() || 'GET';
  const headers = normalizeHeaders(event.headers);
  const origin = headers.origin?.trim();
  const originAllowed = Boolean(origin && allowedOrigins().has(origin));

  if (!originAllowed) {
    return response(403, { stored: false, message: 'Источник запроса не разрешён' });
  }
  if (method === 'OPTIONS') return response(204, null, origin);
  if (method !== 'POST') return response(405, { stored: false, message: 'Метод не поддерживается' }, origin);

  try {
    const rawBody = parseBody(event);
    const result = await withConfiguredStorage((storage) => (
      storeAndNotify(storage, rawBody, headers['x-lead-id'])
    ));
    return response(result.duplicate ? 200 : 201, result.receipt as unknown as Record<string, unknown>, origin);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return response(error.statusCode, { stored: false, message: error.message }, origin);
    }
    console.error('Lead request failed', { error: error instanceof Error ? error.name : 'UnknownError' });
    return response(500, { stored: false, message: 'Не удалось сохранить заявку' }, origin);
  }
}
