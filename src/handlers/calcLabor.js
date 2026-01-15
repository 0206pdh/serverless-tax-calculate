import * as taxService from '../services/taxService.js';
import { parseJsonBody, ok, fail, normalizeBusinessInfo, normalizeDeductions, toNumber } from './utils.js';

export const handler = async (event) => {
  try {
    const body = parseJsonBody(event);
    const salaryInfo = body?.salaryInfo || {};
    const deductions = normalizeDeductions(body?.deductions);
    const businessInfo = normalizeBusinessInfo(body?.businessInfo);

    const result = await taxService.calculateLaborTax({
      monthlySalary: toNumber(salaryInfo.monthlySalary),
      bonus: toNumber(salaryInfo.bonus),
      nonTaxableAllowance: toNumber(salaryInfo.nonTaxableAllowance),
      deductions,
      businessInfo
    });

    return ok(result);
  } catch (error) {
    return fail(error);
  }
};
