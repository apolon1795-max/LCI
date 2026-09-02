
import { MetadataCredentialsProvider } from '@ydbjs/auth/metadata';
import { Driver } from '@ydbjs/core';
import { query, QueryClient } from '@ydbjs/query';
import {
  LeadStorage,
  LeadSubmission,
  NotificationDelivery,
  StoredLead,
  StoreResult,
} from './types.js';

const TABLE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,62}$/;
const memoryLeads = new Map<string, StoredLead>();

function cloneLead(lead: StoredLead): StoredLead {
  return structuredClone(lead);
}

export class MemoryLeadStorage implements LeadStorage {
  async ensureSchema(): Promise<void> {}

  async insertOrGet(payload: LeadSubmission, storedAt: string, giftCode: string): Promise<StoreResult> {
    const existing = memoryLeads.get(payload.leadId);
    if (existing) return { lead: cloneLead(existing), duplicate: true };

    const lead: StoredLead = {
      payload: structuredClone(payload),
      storedAt,
      giftCode,
      telegramStatus: 'pending',
      emailStatus: 'pending',
    };
    memoryLeads.set(payload.leadId, lead);
    return { lead: cloneLead(lead), duplicate: false };
  }

  async updateNotificationStatus(
    leadId: string,
    telegramStatus: NotificationDelivery,
    emailStatus: NotificationDelivery,
  ): Promise<void> {
    const lead = memoryLeads.get(leadId);
    if (!lead) throw new Error('Stored lead not found');
    lead.telegramStatus = telegramStatus;
    lead.emailStatus = emailStatus;
  }
}

interface ExistingLeadRow {
  payload_json: string;
  stored_at: string;
  gift_code: string;
  telegram_status: string;
  email_status: string;
}

function normalizeStatus(value: string): NotificationDelivery {
  return value === 'sent' || value === 'skipped' || value === 'failed' ? value : 'pending';
}

export class YdbLeadStorage implements LeadStorage {
  private readonly table;

  constructor(private readonly sql: QueryClient, tableName: string) {
    if (!TABLE_NAME_PATTERN.test(tableName)) throw new Error('YDB_TABLE_NAME has an unsafe format');
    this.table = sql.identifier(tableName);
  }

  async ensureSchema(): Promise<void> {
    await this.sql`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        lead_id Text NOT NULL,
        stored_at Text NOT NULL,
        created_at Text NOT NULL,
        source Text NOT NULL,
        gift_code Text NOT NULL,
        contact_name Text NOT NULL,
        contact_phone Text NOT NULL,
        contact_email Text NOT NULL,
        grade Text NOT NULL,
        subject_id Text NOT NULL,
        subject_name Text NOT NULL,
        assessment_id Text NOT NULL,
        assessment_name Text NOT NULL,
        branch_id Text NOT NULL,
        branch_name Text NOT NULL,
        branch_address Text NOT NULL,
        teacher_id Text NOT NULL,
        teacher_name Text NOT NULL,
        teacher_is_demo Bool NOT NULL,
        consent_url Text NOT NULL,
        page_url Text NOT NULL,
        utm_json Text NOT NULL,
        payload_json Text NOT NULL,
        telegram_status Text NOT NULL,
        email_status Text NOT NULL,
        PRIMARY KEY (lead_id)
      )
    `;
  }

  async insertOrGet(payload: LeadSubmission, storedAt: string, giftCode: string): Promise<StoreResult> {
    return this.sql.begin({ idempotent: true }, async (tx) => {
      const [rows] = await tx<[ExistingLeadRow]>`
        SELECT payload_json, stored_at, gift_code, telegram_status, email_status
        FROM ${this.table}
        WHERE lead_id = ${payload.leadId}
      `;
      const existing = rows?.[0];
      if (existing) {
        const existingPayload = JSON.parse(existing.payload_json) as LeadSubmission;
        return {
          duplicate: true,
          lead: {
            payload: existingPayload,
            storedAt: existing.stored_at,
            giftCode: existing.gift_code,
            telegramStatus: normalizeStatus(existing.telegram_status),
            emailStatus: normalizeStatus(existing.email_status),
          },
        };
      }

      const record = {
        lead_id: payload.leadId,
        stored_at: storedAt,
        created_at: payload.createdAt,
        source: payload.source,
        gift_code: giftCode,
        contact_name: payload.contact.name,
        contact_phone: payload.contact.phone,
        contact_email: payload.contact.email ?? '',
        grade: payload.selections.grade,
        subject_id: payload.selections.subject.id,
        subject_name: payload.selections.subject.name,
        assessment_id: payload.selections.assessment.id,
        assessment_name: payload.selections.assessment.name,
        branch_id: payload.selections.branch.id,
        branch_name: payload.selections.branch.name,
        branch_address: payload.selections.branch.address,
        teacher_id: payload.selections.teacher.id,
        teacher_name: payload.selections.teacher.name,
        teacher_is_demo: payload.selections.teacher.isDemo,
        consent_url: payload.consent.privacyUrl,
        page_url: payload.context.pageUrl,
        utm_json: JSON.stringify(payload.context.utm),
        payload_json: JSON.stringify(payload),
        telegram_status: 'pending',
        email_status: 'pending',
      };

      await tx`
        UPSERT INTO ${this.table} (
          lead_id, stored_at, created_at, source, gift_code,
          contact_name, contact_phone, contact_email, grade,
          subject_id, subject_name, assessment_id, assessment_name,
          branch_id, branch_name, branch_address,
          teacher_id, teacher_name, teacher_is_demo,
          consent_url, page_url, utm_json, payload_json,
          telegram_status, email_status
        )
        VALUES (
          ${record.lead_id}, ${record.stored_at}, ${record.created_at}, ${record.source}, ${record.gift_code},
          ${record.contact_name}, ${record.contact_phone}, ${record.contact_email}, ${record.grade},
          ${record.subject_id}, ${record.subject_name}, ${record.assessment_id}, ${record.assessment_name},
          ${record.branch_id}, ${record.branch_name}, ${record.branch_address},
          ${record.teacher_id}, ${record.teacher_name}, ${record.teacher_is_demo},
          ${record.consent_url}, ${record.page_url}, ${record.utm_json}, ${record.payload_json},
          ${record.telegram_status}, ${record.email_status}
        )
      `;
      return {
        duplicate: false,
        lead: {
          payload,
          storedAt,
          giftCode,
          telegramStatus: 'pending',
          emailStatus: 'pending',
        },
      };
    });
  }

  async updateNotificationStatus(
    leadId: string,
    telegramStatus: NotificationDelivery,
    emailStatus: NotificationDelivery,
  ): Promise<void> {
    await this.sql`
      UPDATE ${this.table}
      SET telegram_status = ${telegramStatus}, email_status = ${emailStatus}
      WHERE lead_id = ${leadId}
    `;
  }
}

export async function withConfiguredStorage<T>(callback: (storage: LeadStorage) => Promise<T>): Promise<T> {
  if (process.env.LEAD_STORAGE_MODE === 'memory') {
    const storage = new MemoryLeadStorage();
    await storage.ensureSchema();
    return callback(storage);
  }

  const connectionString = process.env.YDB_CONNECTION_STRING?.trim();
  if (!connectionString) throw new Error('YDB_CONNECTION_STRING is required');

  const driver = new Driver(connectionString, {
    credentialsProvider: new MetadataCredentialsProvider({}),
  });
  const sql = query(driver, { poolOptions: { minSize: 0, maxSize: 2 } });

  try {
    await driver.ready();
    const storage = new YdbLeadStorage(sql, process.env.YDB_TABLE_NAME?.trim() || 'lci_leads');
    await storage.ensureSchema();
    return await callback(storage);
  } finally {
    await sql[Symbol.asyncDispose]();
    driver.close();
  }
}
