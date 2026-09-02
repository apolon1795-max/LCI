import { randomUUID } from 'node:crypto';
import { LeadSubmission } from './types.js';

export function makeValidLead(overrides: Partial<LeadSubmission> = {}): LeadSubmission {
  const now = Date.now();
  const lead: LeadSubmission = {
    schemaVersion: 1,
    leadId: randomUUID(),
    source: 'lci-school-subjects',
    createdAt: new Date(now).toISOString(),
    contact: {
      name: 'Тестовый родитель',
      phone: '+7 (912) 000-00-00',
      email: 'parent@example.ru',
    },
    selections: {
      grade: '7 класс',
      subject: { id: 'math', name: 'Математика' },
      assessment: { id: 'exam', name: 'Нужна подготовка к экзаменам' },
      branch: { id: 'pushkinskaya', name: 'Филиал на Пушкинской', address: 'ул. Пушкинская, 198' },
      teacher: { id: 't1', name: 'Анна Сергеевна', isDemo: true },
    },
    consent: {
      accepted: true,
      privacyUrl: 'https://lci-izh.ru/content/kontakti',
      acceptedAt: new Date(now).toISOString(),
    },
    context: {
      pageUrl: 'https://lci.example.test/',
      referrer: '',
      language: 'ru-RU',
      formStartedAt: new Date(now - 5_000).toISOString(),
      utm: { utm_source: 'test' },
    },
    antiSpam: { website: '' },
  };
  return { ...lead, ...overrides };
}
