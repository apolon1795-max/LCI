import { createHash } from 'node:crypto';
import { LeadSubmission } from './types.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PHONE_PATTERN = /^\d{10,11}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FORM_DURATION_MS = 1_500;
const MAX_FORM_DURATION_MS = 24 * 60 * 60 * 1_000;

export class RequestValidationError extends Error {
  constructor(message: string, public readonly statusCode = 422) {
    super(message);
    this.name = 'RequestValidationError';
  }
}

function requireRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestValidationError(`Некорректное поле: ${field}`);
  }
  return value as Record<string, unknown>;
}

function cleanRequiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string') throw new RequestValidationError(`Некорректное поле: ${field}`);
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned || cleaned.length > maxLength) {
    throw new RequestValidationError(`Некорректное поле: ${field}`);
  }
  return cleaned;
}

function cleanOptionalString(value: unknown, field: string, maxLength: number): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') throw new RequestValidationError(`Некорректное поле: ${field}`);
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (cleaned.length > maxLength) throw new RequestValidationError(`Некорректное поле: ${field}`);
  return cleaned;
}

function requireIsoDate(value: unknown, field: string): string {
  const iso = cleanRequiredString(value, field, 64);
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) throw new RequestValidationError(`Некорректное поле: ${field}`);
  return new Date(timestamp).toISOString();
}

function requireHttpsUrl(value: unknown, field: string, maxLength = 2_000): string {
  const raw = cleanRequiredString(value, field, maxLength);
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') throw new Error('HTTPS required');
    return url.toString();
  } catch {
    throw new RequestValidationError(`Некорректное поле: ${field}`);
  }
}

function requirePageUrl(value: unknown): string {
  const raw = cleanRequiredString(value, 'context.pageUrl', 2_000);
  try {
    const url = new URL(raw);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) throw new Error('Unsafe protocol');
    return url.toString();
  } catch {
    throw new RequestValidationError('Некорректное поле: context.pageUrl');
  }
}

function readSelection(value: unknown, field: string): { id: string; name: string } {
  const record = requireRecord(value, field);
  return {
    id: cleanRequiredString(record.id, `${field}.id`, 80),
    name: cleanRequiredString(record.name, `${field}.name`, 160),
  };
}

function readUtm(value: unknown): Record<string, string> {
  const record = requireRecord(value, 'context.utm');
  const allowedKeys = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']);
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(record)) {
    if (!allowedKeys.has(key)) continue;
    const cleaned = cleanOptionalString(item, `context.utm.${key}`, 200);
    if (cleaned) result[key] = cleaned;
  }
  return result;
}

export function makeGiftCode(leadId: string): string {
  const digest = createHash('sha256').update(`lci-gift:${leadId}`).digest('hex').slice(0, 8).toUpperCase();
  return `LCI-${digest}`;
}

export function validateLeadSubmission(raw: unknown): LeadSubmission {
  const root = requireRecord(raw, 'body');
  if (root.schemaVersion !== 1) throw new RequestValidationError('Неподдерживаемая версия формы');
  if (root.source !== 'lci-school-subjects') throw new RequestValidationError('Некорректный источник заявки');

  const leadId = cleanRequiredString(root.leadId, 'leadId', 64);
  if (!UUID_PATTERN.test(leadId)) throw new RequestValidationError('Некорректный идентификатор заявки');

  const createdAt = requireIsoDate(root.createdAt, 'createdAt');
  const createdTimestamp = Date.parse(createdAt);
  const now = Date.now();
  if (createdTimestamp > now + 5 * 60_000 || createdTimestamp < now - 7 * 24 * 60 * 60_000) {
    throw new RequestValidationError('Некорректное время заявки');
  }

  const contact = requireRecord(root.contact, 'contact');
  const name = cleanRequiredString(contact.name, 'contact.name', 80);
  if (name.length < 2) throw new RequestValidationError('Укажите имя');
  const phone = cleanRequiredString(contact.phone, 'contact.phone', 24);
  const phoneDigits = phone.replace(/\D/g, '');
  if (!PHONE_PATTERN.test(phoneDigits)) throw new RequestValidationError('Проверьте номер телефона');
  const email = cleanOptionalString(contact.email, 'contact.email', 160).toLowerCase();
  if (email && !EMAIL_PATTERN.test(email)) throw new RequestValidationError('Проверьте электронную почту');

  const selections = requireRecord(root.selections, 'selections');
  const subject = readSelection(selections.subject, 'selections.subject');
  const assessment = readSelection(selections.assessment, 'selections.assessment');
  const branchRecord = requireRecord(selections.branch, 'selections.branch');
  const branch = {
    ...readSelection(branchRecord, 'selections.branch'),
    address: cleanRequiredString(branchRecord.address, 'selections.branch.address', 240),
  };
  const teacherRecord = requireRecord(selections.teacher, 'selections.teacher');
  if (typeof teacherRecord.isDemo !== 'boolean') {
    throw new RequestValidationError('Некорректное поле: selections.teacher.isDemo');
  }
  const teacher = {
    ...readSelection(teacherRecord, 'selections.teacher'),
    isDemo: teacherRecord.isDemo,
  };

  const consent = requireRecord(root.consent, 'consent');
  if (consent.accepted !== true) throw new RequestValidationError('Не принято согласие на обработку данных');
  const privacyUrl = requireHttpsUrl(consent.privacyUrl, 'consent.privacyUrl');
  const acceptedAt = requireIsoDate(consent.acceptedAt, 'consent.acceptedAt');

  const context = requireRecord(root.context, 'context');
  const formStartedAt = requireIsoDate(context.formStartedAt, 'context.formStartedAt');
  const formDuration = createdTimestamp - Date.parse(formStartedAt);
  if (formDuration < MIN_FORM_DURATION_MS || formDuration > MAX_FORM_DURATION_MS) {
    throw new RequestValidationError('Форма заполнена за недопустимое время');
  }

  const antiSpam = requireRecord(root.antiSpam, 'antiSpam');
  const website = cleanOptionalString(antiSpam.website, 'antiSpam.website', 240);
  if (website) throw new RequestValidationError('Заявка отклонена');

  return {
    schemaVersion: 1,
    leadId,
    source: 'lci-school-subjects',
    createdAt,
    contact: {
      name,
      phone,
      ...(email ? { email } : {}),
    },
    selections: {
      grade: cleanRequiredString(selections.grade, 'selections.grade', 80),
      subject,
      assessment,
      branch,
      teacher,
    },
    consent: {
      accepted: true,
      privacyUrl,
      acceptedAt,
    },
    context: {
      pageUrl: requirePageUrl(context.pageUrl),
      referrer: cleanOptionalString(context.referrer, 'context.referrer', 2_000),
      language: cleanOptionalString(context.language, 'context.language', 32),
      formStartedAt,
      utm: readUtm(context.utm),
    },
    antiSpam: { website: '' },
  };
}
