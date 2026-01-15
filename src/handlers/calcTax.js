import * as taxService from '../services/taxService.js';
import { parseJsonBody, ok, fail, normalizeDeductions, toNumber } from './utils.js';

export const handler = async (event) => {
  try {
    const body = parseJsonBody(event);
    const income = toNumber(body?.income);
    const deductions = normalizeDeductions(body?.deductions);

    const result = await taxService.calculateTax(income, deductions);

    return ok(result);
  } catch (error) {
    return fail(error);
  }
};
