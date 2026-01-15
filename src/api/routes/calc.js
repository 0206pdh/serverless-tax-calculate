import express from 'express';
import * as taxService from '../../services/taxService.js';
import { BUSINESS_TYPES } from '../../config/tax.js';

const router = express.Router();

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeIncomeInfo = (input = {}) => ({
  businessIncome: toNumber(input.businessIncome),
  otherIncome: toNumber(input.otherIncome),
  capitalGains: toNumber(input.capitalGains),
  interestIncome: toNumber(input.interestIncome),
  dividendIncome: toNumber(input.dividendIncome)
});

const normalizeDeductions = (input = {}) => ({
  insurance: toNumber(input.insurance),
  medical: toNumber(input.medical),
  education: toNumber(input.education),
  donation: toNumber(input.donation),
  retirement: toNumber(input.retirement),
  other: toNumber(input.other)
});

const normalizeBusinessInfo = (input = {}) => ({
  companyName: input.companyName || 'Unknown',
  businessNumber: input.businessNumber || 'N/A',
  taxType: input.taxType || BUSINESS_TYPES.SOLE,
  isSimplified: Boolean(input.isSimplified),
  industry: input.industry || 'RETAIL'
});

router.post('/vat', async (req, res, next) => {
  try {
    const salesInfo = req.body?.salesInfo || {};
    const businessInfo = normalizeBusinessInfo(req.body?.businessInfo);

    const result = await taxService.calculateVAT({
      salesInfo: {
        totalSales: toNumber(salesInfo.totalSales),
        totalPurchases: toNumber(salesInfo.totalPurchases),
        nonTaxableSales: toNumber(salesInfo.nonTaxableSales)
      },
      businessInfo
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/income', async (req, res, next) => {
  try {
    const businessInfo = normalizeBusinessInfo(req.body?.businessInfo);
    const incomeInfo = normalizeIncomeInfo(req.body?.incomeInfo);
    const deductions = normalizeDeductions(req.body?.deductions);

    const result = await taxService.calculateIncomeTax({
      incomeInfo,
      deductions,
      businessInfo
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/labor', async (req, res, next) => {
  try {
    const salaryInfo = req.body?.salaryInfo || {};
    const deductions = normalizeDeductions(req.body?.deductions);
    const businessInfo = normalizeBusinessInfo(req.body?.businessInfo);

    const result = await taxService.calculateLaborTax({
      monthlySalary: toNumber(salaryInfo.monthlySalary),
      bonus: toNumber(salaryInfo.bonus),
      nonTaxableAllowance: toNumber(salaryInfo.nonTaxableAllowance),
      deductions,
      businessInfo
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/tax', async (req, res, next) => {
  try {
    const income = toNumber(req.body?.income);
    const deductions = normalizeDeductions(req.body?.deductions);

    const result = await taxService.calculateTax(income, deductions);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/refund', async (req, res, next) => {
  try {
    const income = toNumber(req.body?.income);
    const paidTax = toNumber(req.body?.paidTax);
    const deductions = normalizeDeductions(req.body?.deductions);
    const businessInfo = normalizeBusinessInfo(req.body?.businessInfo);

    const result = await taxService.calculateRefund({
      income,
      paidTax,
      deductions,
      businessInfo
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/corporate', async (req, res, next) => {
  try {
    const incomeInfo = normalizeIncomeInfo(req.body?.incomeInfo);
    const deductions = normalizeDeductions(req.body?.deductions);
    const businessInfo = normalizeBusinessInfo(req.body?.businessInfo);

    const result = await taxService.calculateCorporateTax({
      incomeInfo,
      deductions,
      businessInfo
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/sole', async (req, res, next) => {
  try {
    const incomeInfo = normalizeIncomeInfo(req.body?.incomeInfo);
    const deductions = normalizeDeductions(req.body?.deductions);
    const businessInfo = normalizeBusinessInfo(req.body?.businessInfo);

    const result = await taxService.calculateSoleTax({
      incomeInfo,
      deductions,
      businessInfo
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
