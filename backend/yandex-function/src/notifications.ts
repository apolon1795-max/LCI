
import nodemailer from 'nodemailer';
import { setDefaultResultOrder } from 'node:dns';
import { lookup } from 'node:dns/promises';
import { LeadSubmission, NotificationDelivery } from './types.js';

const TELEGRAM_TIMEOUT_MS = 8_000;
const EMAIL_TIMEOUT_MS = 7_000;

setDefaultResultOrder('ipv4first');

export interface NotificationStatuses {
  telegram: Exclude<NotificationDelivery, 'pending'>;
  email: Exclude<NotificationDelivery, 'pending'>;
}

interface TelegramApiResponse {
  ok?: unknown;
  error_code?: unknown;
  description?: unknown;
}

interface TelegramRelayResponse {
  ok?: unknown;
  error?: unknown;
  errorCode?: unknown;
}

async function telegramDnsSummary(): Promise<Array<{ address: string; family: number }> | string> {
  try {
    return await Promise.race([
      lookup('api.telegram.org', { all: true }),
      new Promise<string>((resolve) => setTimeout(() => resolve('lookup-timeout'), 1_500)),
    ]);
  } catch (error) {
    return error instanceof Error ? error.name : 'lookup-failed';
  }
}

function envFlag(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  return value === '1' || value === 'true' || value === 'yes';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildNotificationText(payload: LeadSubmission, giftCode: string, includeContacts: boolean): string {
  const lines = [
    'Новая заявка LCI',
    `Код: ${giftCode}`,
    `Класс: ${payload.selections.grade}`,
    `Предмет: ${payload.selections.subject.name}`,
    `Цель: ${payload.selections.assessment.name}`,
    `Филиал: ${payload.selections.branch.name} — ${payload.selections.branch.address}`,
    `Преподаватель: ${payload.selections.teacher.name}${payload.selections.teacher.isDemo ? ' (демо)' : ''}`,
  ];

  if (includeContacts) {
    lines.push(
      `Имя: ${payload.contact.name}`,
      `Телефон: ${payload.contact.phone}`,
      `Email: ${payload.contact.email || 'не указан'}`,
    );
  } else {
    lines.push('Контакты сохранены в защищённом реестре YDB.');
  }

  lines.push(`ID: ${payload.leadId}`);
  return lines.join('\n');
}

async function sendTelegram(payload: LeadSubmission, giftCode: string): Promise<NotificationStatuses['telegram']> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token && !chatId) return 'skipped';
  if (!token || !chatId) return 'failed';

  const includeContacts = envFlag('TELEGRAM_INCLUDE_CONTACTS', false);
  const message = buildNotificationText(payload, giftCode, includeContacts);
  const html = escapeHtml(message);

  const relayUrl = process.env.TELEGRAM_RELAY_URL?.trim();
  if (relayUrl) {
    let parsedRelayUrl: URL;
    try {
      parsedRelayUrl = new URL(relayUrl);
    } catch {
      console.error('Telegram relay URL is invalid');
      return 'failed';
    }
    if (parsedRelayUrl.protocol !== 'https:') {
      console.error('Telegram relay URL must use HTTPS');
      return 'failed';
    }

    try {
      const response = await fetch(parsedRelayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId, text: html }),
        signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
      });
      const body = await response.json().catch(() => null) as TelegramRelayResponse | null;
      if (!response.ok || body?.ok !== true) {
        console.error('Telegram relay failed', {
          status: response.status,
          error: typeof body?.error === 'string' ? body.error.slice(0, 100) : undefined,
          errorCode: typeof body?.errorCode === 'number' ? body.errorCode : undefined,
        });
        return 'failed';
      }
      return 'sent';
    } catch (error) {
      console.error('Telegram relay request failed', {
        error: error instanceof Error ? error.name : 'UnknownError',
      });
      return 'failed';
    }
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => null) as TelegramApiResponse | null;
    if (!response.ok || body?.ok !== true) {
      console.error('Telegram notification failed', {
        status: response.status,
        errorCode: typeof body?.error_code === 'number' ? body.error_code : undefined,
        description: typeof body?.description === 'string' ? body.description.slice(0, 300) : undefined,
      });
      return 'failed';
    }
    return 'sent';
  } catch (error) {
    const cause = error && typeof error === 'object' && 'cause' in error
      ? (error as { cause?: { code?: unknown } }).cause
      : undefined;
    console.error('Telegram notification request failed', {
      error: error instanceof Error ? error.name : 'UnknownError',
      causeCode: typeof cause?.code === 'string' || typeof cause?.code === 'number'
        ? cause.code
        : undefined,
      dns: await telegramDnsSummary(),
    });
    return 'failed';
  }
}

async function sendEmail(payload: LeadSubmission, giftCode: string): Promise<NotificationStatuses['email']> {
  const config = {
    host: process.env.SMTP_HOST?.trim(),
    port: process.env.SMTP_PORT?.trim(),
    user: process.env.SMTP_USER?.trim(),
    password: process.env.SMTP_PASSWORD?.trim(),
    from: process.env.EMAIL_FROM?.trim(),
    to: process.env.EMAIL_TO?.trim(),
  };
  const configuredValues = Object.values(config).filter(Boolean).length;
  if (configuredValues === 0) return 'skipped';
  if (configuredValues !== Object.keys(config).length) return 'failed';

  const port = Number(config.port);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) return 'failed';

  const includeContacts = envFlag('EMAIL_INCLUDE_CONTACTS', true);
  const text = buildNotificationText(payload, giftCode, includeContacts);
  const html = `<div style="font-family:Arial,sans-serif;white-space:pre-line">${escapeHtml(text)}</div>`;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port,
    secure: envFlag('SMTP_SECURE', port === 465),
    auth: { user: config.user, pass: config.password },
    connectionTimeout: EMAIL_TIMEOUT_MS,
    greetingTimeout: EMAIL_TIMEOUT_MS,
    socketTimeout: EMAIL_TIMEOUT_MS,
  });
  try {
    await transporter.sendMail({
      from: config.from,
      to: config.to,
      subject: `Новая заявка LCI · ${giftCode}`,
      text,
      html,
    });
    return 'sent';
  } catch {
    return 'failed';
  } finally {
    transporter.close();
  }
}

export async function deliverNotifications(
  payload: LeadSubmission,
  giftCode: string,
): Promise<NotificationStatuses> {
  const [telegram, email] = await Promise.all([
    sendTelegram(payload, giftCode),
    sendEmail(payload, giftCode),
  ]);
  return { telegram, email };
}
