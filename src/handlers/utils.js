import { BUSINESS_TYPES } from '../config/tax.js';

export const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const normalizeIncomeInfo = (input = {}) => ({
  businessIncome: toNumber(input.businessIncome),
  otherIncome: toNumber(input.otherIncome),
  capitalGains: toNumber(input.capitalGains),
  interestIncome: toNumber(input.interestIncome),
  dividendIncome: toNumber(input.dividendIncome)
});

export const normalizeDeductions = (input = {}) => ({
  insurance: toNumber(input.insurance),
  medical: toNumber(input.medical),
  education: toNumber(input.education),
  donation: toNumber(input.donation),
  retirement: toNumber(input.retirement),
  other: toNumber(input.other)
});

export const normalizeBusinessInfo = (input = {}) => ({
  companyName: input.companyName || 'Unknown',
  businessNumber: input.businessNumber || 'N/A',
  taxType: input.taxType || BUSINESS_TYPES.SOLE,
  isSimplified: Boolean(input.isSimplified),
  industry: input.industry || 'RETAIL'
});

export const parseJsonBody = (event) => {
  if (!event || !event.body) return {};
  if (typeof event.body === 'object') return event.body;
  try {
    return JSON.parse(event.body);
  } catch (error) {
    return {};
  }
};

export const ok = (data) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ success: true, data })
});

export const fail = (error) => ({
  statusCode: 500,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ success: false, error: error?.message || 'Internal error' })
});
