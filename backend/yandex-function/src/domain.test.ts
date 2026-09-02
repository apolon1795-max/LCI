import assert from 'node:assert/strict';
import test from 'node:test';
import { makeGiftCode, RequestValidationError, validateLeadSubmission } from './domain.js';
import { makeValidLead } from './test-fixture.js';

test('validates and normalizes a legitimate lead', () => {
  const input = makeValidLead({
    contact: { name: '  Анна   Петрова  ', phone: '+7 (912) 000-00-00', email: 'USER@EXAMPLE.RU' },
  });
  const result = validateLeadSubmission(input);
  assert.equal(result.contact.name, 'Анна Петрова');
  assert.equal(result.contact.email, 'user@example.ru');
  assert.equal(result.selections.teacher.isDemo, true);
});

test('creates the same stable gift code for retries', () => {
  const leadId = 'd5ab75fe-bd3e-4fab-92cb-75136a8f7df4';
  const first = makeGiftCode(leadId);
  assert.equal(first, makeGiftCode(leadId));
  assert.match(first, /^LCI-[0-9A-F]{8}$/);
});

test('rejects a honeypot submission', () => {
  const input = makeValidLead({ antiSpam: { website: 'https://spam.example' } });
  assert.throws(() => validateLeadSubmission(input), RequestValidationError);
});

test('rejects a form submitted too quickly', () => {
  const input = makeValidLead();
  input.context.formStartedAt = new Date(Date.parse(input.createdAt) - 100).toISOString();
  assert.throws(() => validateLeadSubmission(input), /недопустимое время/);
});
