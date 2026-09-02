export type NotificationDelivery = 'pending' | 'sent' | 'skipped' | 'failed';

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

export interface StoredLead {
  payload: LeadSubmission;
  storedAt: string;
  giftCode: string;
  telegramStatus: NotificationDelivery;
  emailStatus: NotificationDelivery;
}

export interface StoreResult {
  lead: StoredLead;
  duplicate: boolean;
}

export interface LeadStorage {
  ensureSchema(): Promise<void>;
  insertOrGet(payload: LeadSubmission, storedAt: string, giftCode: string): Promise<StoreResult>;
  updateNotificationStatus(
    leadId: string,
    telegramStatus: NotificationDelivery,
    emailStatus: NotificationDelivery,
  ): Promise<void>;
}

export interface CloudFunctionEvent {
  httpMethod?: string;
  headers?: Record<string, string | undefined>;
  body?: string | Record<string, unknown> | null;
  isBase64Encoded?: boolean;
}

export interface CloudFunctionResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded?: false;
}

export interface PublicLeadReceipt {
  stored: true;
  leadId: string;
  giftCode: string;
  storedAt: string;
  duplicate: boolean;
  notifications: {
    telegram: Exclude<NotificationDelivery, 'pending'>;
    email: Exclude<NotificationDelivery, 'pending'>;
  };
}
