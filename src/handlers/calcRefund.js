import * as taxService from '../services/taxService.js';
import { parseJsonBody, ok, fail, normalizeBusinessInfo, normalizeDeductions, toNumber } from './utils.js';

export const handler = async (event) => {
  try {
    const body = parseJsonBody(event);
    const income = toNumber(body?.income);
    const paidTax = toNumber(body?.paidTax);
    const deductions = normalizeDeductions(body?.deductions);
    const businessInfo = normalizeBusinessInfo(body?.businessInfo);

    const result = await taxService.calculateRefund({
      income,
      paidTax,
      deductions,
      businessInfo
    });

    return ok(result);
  } catch (error) {
    return fail(error);
  }
};
