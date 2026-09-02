import { BRANCHES, getAssessmentsForGrade, SUBJECTS, TEACHERS } from '../data';
import { AppState, ContactDetails } from '../types';

const DEFAULT_PRIVACY_URL = 'https://lci-izh.ru/content/kontakti';
const REQUEST_TIMEOUT_MS = 12_000;
const PHONE_DIGITS_PATTERN = /^\d{10,11}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NotificationDelivery = 'sent' | 'skipped' | 'failed';

export interface LeadReceipt {
  leadId: string;
  giftCode: string;
  storedAt: string;
  duplicate: boolean;
  notifications: {
    telegram: NotificationDelivery;
    email: NotificationDelivery;
  };
}

export interface LeadFormMeta {
  acceptedPrivacy: boolean;
  formStartedAt: string;
  website: string;
  leadId: string;
}

export interface LeadSubmission {
  schemaVersion: 1;
  leadId: string;
  source: 'lci-school-subjects';
  createdAt: string;
  contact: {
    name: string;
    phone: string;
    email?: string;
  };
  selections: {
    grade: string;
    subject: { id: string; name: string };
    assessment: { id: string; name: string };
    branch: { id: string; name: string; address: string };
    teacher: { id: string; name: string; isDemo: boolean };
  };
  consent: {
    accepted: true;
    privacyUrl: string;
    acceptedAt: string;
  };
  context: {
    pageUrl: string;
    referrer: string;
    language: string;
    formStartedAt: string;
    utm: Record<string, string>;
  };
  antiSpam: {
    website: string;
  };
}

type LeadErrorCode = 'not_configured' | 'timeout' | 'network' | 'rejected' | 'invalid_response';

export class LeadSubmissionError extends Error {
  constructor(public readonly code: LeadErrorCode, message: string) {
    super(message);
    this.name = 'LeadSubmissionError';
  }
}

export function getPrivacyUrl(): string {
  return import.meta.env.VITE_PRIVACY_URL?.trim() || DEFAULT_PRIVACY_URL;
}

export function createLeadId(): string {
  return crypto.randomUUID();
}

export function isPhoneValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  if (!PHONE_DIGITS_PATTERN.test(digits)) return false;
  return digits.length === 10 || digits.startsWith('7') || digits.startsWith('8');
}

export function isEmailValid(email: string): boolean {
  return email.trim() === '' || EMAIL_PATTERN.test(email.trim());
}

function resolveRequiredSelection<T extends { id: string }>(items: T[], id: string | null, field: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new LeadSubmissionError('rejected', `Не выбран обязательный параметр: ${field}`);
  return item;
}

function readUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = params.get(key)?.trim();
    if (value) result[key] = value.slice(0, 200);
  }
  return result;
}

export function buildLeadSubmission(
  state: AppState,
  contact: ContactDetails,
  meta: LeadFormMeta,
): LeadSubmission {
  if (!state.grade) throw new LeadSubmissionError('rejected', 'Не выбран класс');
  if (!meta.acceptedPrivacy) throw new LeadSubmissionError('rejected', 'Не принято согласие на обработку данных');
  if (contact.name.trim().length < 2) throw new LeadSubmissionError('rejected', 'Укажите имя');
  if (!isPhoneValid(contact.phone)) throw new LeadSubmissionError('rejected', 'Проверьте номер телефона');
  if (!isEmailValid(contact.email)) throw new LeadSubmissionError('rejected', 'Проверьте электронную почту');

  const subject = resolveRequiredSelection(SUBJECTS, state.subject, 'предмет');
  const assessment = resolveRequiredSelection(getAssessmentsForGrade(state.grade), state.assessment, 'цель');
  const branch = resolveRequiredSelection(BRANCHES, state.branch, 'филиал');
  const teacher = resolveRequiredSelection(TEACHERS, state.teacher, 'преподаватель');
  const submittedAt = new Date().toISOString();

  return {
    schemaVersion: 1,
    leadId: meta.leadId,
    source: 'lci-school-subjects',
    createdAt: submittedAt,
    contact: {
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      ...(contact.email.trim() ? { email: contact.email.trim().toLowerCase() } : {}),
    },
    selections: {
      grade: state.grade,
      subject: { id: subject.id, name: subject.name },
      assessment: { id: assessment.id, name: assessment.title },
      branch: { id: branch.id, name: branch.name, address: branch.address },
      teacher: { id: teacher.id, name: teacher.name, isDemo: teacher.isDemo },
    },
    consent: {
      accepted: true,
      privacyUrl: getPrivacyUrl(),
      acceptedAt: submittedAt,
    },
    context: {
      pageUrl: window.location.href.slice(0, 2_000),
      referrer: document.referrer.slice(0, 2_000),
      language: navigator.language,
      formStartedAt: meta.formStartedAt,
      utm: readUtm(),
    },
    antiSpam: {
      website: meta.website,
    },
  };
}

function getEndpoint(): string {
  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT?.trim();
  if (!endpoint) {
    throw new LeadSubmissionError('not_configured', 'Endpoint приёма заявок не настроен');
  }

  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    throw new LeadSubmissionError('not_configured', 'Endpoint приёма заявок указан неверно');
  }

  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  if (parsed.protocol !== 'https:' && !(isLocal && parsed.protocol === 'http:')) {
    throw new LeadSubmissionError('not_configured', 'Endpoint должен использовать HTTPS');
  }
  return parsed.toString();
}

function isLeadReceipt(value: unknown): value is LeadReceipt {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LeadReceipt> & { stored?: unknown };
  const validDeliveries = new Set<NotificationDelivery>(['sent', 'skipped', 'failed']);
  const notifications = candidate.notifications;
  return candidate.stored === true
    && typeof candidate.leadId === 'string'
    && /^LCI-[A-F0-9]{8}$/.test(candidate.giftCode || '')
    && typeof candidate.storedAt === 'string'
    && Number.isFinite(Date.parse(candidate.storedAt))
    && typeof candidate.duplicate === 'boolean'
    && Boolean(notifications)
    && validDeliveries.has(notifications!.telegram)
    && validDeliveries.has(notifications!.email);
}

export async function submitLead(payload: LeadSubmission): Promise<LeadReceipt> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getEndpoint(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Lead-Id': payload.leadId,
      },
      body: JSON.stringify(payload),
      credentials: 'omit',
      signal: controller.signal,
    });

    const responseBody: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = responseBody && typeof responseBody === 'object' && 'message' in responseBody
        ? String(responseBody.message)
        : 'Сервер отклонил заявку';
      throw new LeadSubmissionError('rejected', message);
    }
    if (!isLeadReceipt(responseBody)) {
      throw new LeadSubmissionError('invalid_response', 'Сервер не подтвердил сохранение заявки');
    }
    if (responseBody.leadId !== payload.leadId) {
      throw new LeadSubmissionError('invalid_response', 'Сервер подтвердил другую заявку');
    }
    return responseBody;
  } catch (error) {
    if (error instanceof LeadSubmissionError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new LeadSubmissionError('timeout', 'Сервер не ответил вовремя');
    }
    throw new LeadSubmissionError('network', 'Не удалось связаться с сервером');
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function getLeadErrorMessage(error: unknown): string {
  if (!(error instanceof LeadSubmissionError)) {
    return 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните в LCI.';
  }

  switch (error.code) {
    case 'not_configured':
      return 'Онлайн-запись пока настраивается. Позвоните в LCI по номеру +7 (912) 750-23-04.';
    case 'timeout':
      return 'Ответ сервера задержался. Проверьте интернет и повторите отправку — данные не потеряны.';
    case 'network':
      return 'Нет связи с сервисом заявок. Проверьте интернет и попробуйте ещё раз.';
    case 'rejected':
      return error.message || 'Проверьте заполненные поля и повторите отправку.';
    case 'invalid_response':
      return 'Сервер не подтвердил сохранение. Повторите отправку или позвоните в LCI.';
  }
}
