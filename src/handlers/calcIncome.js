import * as taxService from '../services/taxService.js';
import {
  parseJsonBody,
  ok,
  fail,
  normalizeBusinessInfo,
  normalizeIncomeInfo,
  normalizeDeductions
} from './utils.js';

export const handler = async (event) => {
  try {
    const body = parseJsonBody(event);
    const businessInfo = normalizeBusinessInfo(body?.businessInfo);
    const incomeInfo = normalizeIncomeInfo(body?.incomeInfo);
    const deductions = normalizeDeductions(body?.deductions);

    const result = await taxService.calculateIncomeTax({
      incomeInfo,
      deductions,
      businessInfo
    });

    return ok(result);
  } catch (error) {
    return fail(error);
  }
};
