import * as taxService from '../services/taxService.js';
import { parseJsonBody, ok, fail, normalizeBusinessInfo, toNumber } from './utils.js';

export const handler = async (event) => {
  try {
    const body = parseJsonBody(event);
    const salesInfo = body?.salesInfo || {};
    const businessInfo = normalizeBusinessInfo(body?.businessInfo);

    const result = await taxService.calculateVAT({
      salesInfo: {
        totalSales: toNumber(salesInfo.totalSales),
        totalPurchases: toNumber(salesInfo.totalPurchases),
        nonTaxableSales: toNumber(salesInfo.nonTaxableSales)
      },
      businessInfo
    });

    return ok(result);
  } catch (error) {
    return fail(error);
  }
};
