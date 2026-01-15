import {
  calculateTaxRate,
  calculateVATAmount,
  calculateIncomeTaxAmount,
  calculateLaborTaxAmount
} from '../utils/taxCalculator.js';
import { TAX_RATES, BUSINESS_TYPES, SIMPLIFIED_VAT_RATES } from '../config/tax.js';


export const calculateTax = async (income, deductions = {}) => {
  // Allow deductions to be passed as JSON string or object.
  const parsedDeductions = typeof deductions === 'string' ? 
    JSON.parse(deductions) : deductions || {};
  // Aggregate deductions and compute taxable income.
  const totalDeductions = Object.values(parsedDeductions).reduce(
    (sum, value) => sum + Number(value || 0), 
    0
  );
  const taxableIncome = Math.max(0, income - totalDeductions);
  // Apply progressive tax brackets to taxable income.
  let tax = 0;
  
  if (taxableIncome <= 14000000) {
    tax = taxableIncome * 0.06;
  } else if (taxableIncome <= 50000000) {
    tax = 840000 + (taxableIncome - 14000000) * 0.15;
  } else if (taxableIncome <= 88000000) {
    tax = 6240000 + (taxableIncome - 50000000) * 0.24;
  } else if (taxableIncome <= 150000000) {
    tax = 15360000 + (taxableIncome - 88000000) * 0.35;
  } else if (taxableIncome <= 300000000) {
    tax = 37060000 + (taxableIncome - 150000000) * 0.38;
  } else if (taxableIncome <= 500000000) {
    tax = 94060000 + (taxableIncome - 300000000) * 0.40;
  } else if (taxableIncome <= 1000000000) {
    tax = 174060000 + (taxableIncome - 500000000) * 0.42;
  } else {
    tax = 384060000 + (taxableIncome - 1000000000) * 0.45;
  }
  
  return {
    income,
    totalDeductions,
    taxableIncome,
    // Round to nearest whole number for display parity.
    tax: Math.round(tax),
    effectiveTaxRate: (tax / income * 100).toFixed(2) + '%'
  };
};


export const calculateRefund = async (params) => {
  const {
    income,
    paidTax,
    deductions,
    businessInfo
  } = params;
  // Reuse income tax calculation and compare against paid tax.
  const taxResult = await calculateIncomeTax({
    incomeInfo: { total: income },
    deductions,
    businessInfo
  });
  const refundAmount = paidTax - taxResult.summary.finalTax;

  return {
    ...taxResult,
    paidTax,
    refundAmount,
    status: refundAmount >= 0 ? 'refund' : 'owe'
  };
};


export const calculateLaborTax = async (params) => {
  const {
    monthlySalary,
    bonus,
    nonTaxableAllowance,
    deductions,
    businessInfo
  } = params;
  // Delegate to calculator to derive monthly and annual totals.
  const taxResult = calculateLaborTaxAmount({
    monthlySalary,
    bonus,
    nonTaxableAllowance,
    deductions
  });

  return {
    summary: {
      annualSalary: taxResult.annual.salary,
      annualBonus: taxResult.annual.bonus,
      annualNonTaxable: taxResult.annual.nonTaxable,
      totalDeductions: taxResult.annual.deductions,
      taxableIncome: taxResult.annual.taxableIncome,
      incomeTax: taxResult.annual.incomeTax,
      localIncomeTax: taxResult.annual.localIncomeTax
    },
    details: {
      insurance: {
        nationalPension: Math.floor(monthlySalary * 0.045),
        healthInsurance: Math.floor(monthlySalary * 0.0343),
        longTermCare: Math.floor(monthlySalary * 0.0343 * 0.1227),
        employmentInsurance: Math.floor(monthlySalary * 0.008),
        total: taxResult.monthly.insurance
      },
      deductions: {
        insurance: deductions.insurance || 0,
        medical: deductions.medical || 0,
        education: deductions.education || 0,
        other: deductions.other || 0,
        total: taxResult.annual.deductions
      }
    },
    monthly: taxResult.monthly,
    businessInfo: {
      companyName: businessInfo.companyName,
      businessNumber: businessInfo.businessNumber,
      taxType: businessInfo.taxType
    }
  };
};


export const calculateIncomeTax = async (params) => {
  const {
    incomeInfo,
    deductions,
    businessInfo
  } = params;
  // Consolidate income and deductions for tax rate lookup.
  const totalIncome = Object.values(incomeInfo).reduce((sum, value) => sum + value, 0);
  const totalDeductions = Object.values(deductions).reduce((sum, value) => sum + value, 0);
  const taxRate = calculateTaxRate(totalIncome - totalDeductions);
  // Compute income tax using the derived rate.
  const taxResult = calculateIncomeTaxAmount({
    totalIncome,
    totalDeductions,
    taxRate
  });

  return {
    summary: {
      totalIncome,
      totalDeductions,
      taxableIncome: taxResult.taxableIncome,
      taxRate: taxRate * 100,
      incomeTax: taxResult.incomeTax,
      localIncomeTax: taxResult.localIncomeTax,
      taxCredit: taxResult.taxCredit,
      finalTax: taxResult.finalTax
    },
    details: {
      income: incomeInfo,
      deductions
    },
    businessInfo: {
      companyName: businessInfo.companyName,
      businessNumber: businessInfo.businessNumber,
      taxType: businessInfo.taxType
    }
  };
};


export const calculateVAT = async (params) => {
  const {
    salesInfo,
    businessInfo
  } = params;

  const {
    totalSales,
    totalPurchases,
    nonTaxableSales
  } = salesInfo;
  // Exclude non-taxable sales from VAT base.
  const taxableSales = totalSales - nonTaxableSales;
  // Apply simplified VAT rate by industry when applicable.
  const industryRate = SIMPLIFIED_VAT_RATES[businessInfo.industry] ?? TAX_RATES.SIMPLIFIED_VAT;

  // Use standard VAT for corporations or non-simplified cases.
  const taxRate = businessInfo.taxType === BUSINESS_TYPES.CORPORATION ? TAX_RATES.VAT : 
    (businessInfo.isSimplified ? industryRate : TAX_RATES.VAT);
  // Calculate VAT amounts based on taxable sales and purchases.
  const vatResult = calculateVATAmount({
    taxableSales,
    totalPurchases,
    isSimplified: businessInfo.isSimplified,
    taxRate
  });

  return {
    summary: {
      totalSales,
      totalPurchases,
      taxableAmount: vatResult.supplyAmount,
      outputTax: vatResult.outputTax,
      inputTax: vatResult.inputTax,
      vatAmount: vatResult.vatAmount,
      taxRate: taxRate * 100,
      industryRate: businessInfo.isSimplified ? industryRate * 100 : null
    },
    details: {
      taxableSales,
      nonTaxableSales,
      supplyAmount: vatResult.supplyAmount
    },
    businessInfo: {
      companyName: businessInfo.companyName,
      businessNumber: businessInfo.businessNumber,
      taxType: businessInfo.taxType,
      isSimplified: businessInfo.isSimplified,
      industry: businessInfo.industry
    }
  };
};


export const calculateCorporateTax = async (params) => {
  const {
    incomeInfo,
    deductions,
    businessInfo
  } = params;
  // Reuse income tax calculation and tag as corporate.
  const taxResult = await calculateIncomeTax({
    incomeInfo,
    deductions,
    businessInfo
  });
  return {
    ...taxResult,
    corporateInfo: {
      taxType: BUSINESS_TYPES.CORPORATION,
      isSimplified: false
    }
  };
};


export const calculateSoleTax = async (params) => {
  const {
    incomeInfo,
    deductions,
    businessInfo
  } = params;
  // Reuse income tax calculation and tag as sole proprietor.
  const taxResult = await calculateIncomeTax({
    incomeInfo,
    deductions,
    businessInfo
  });
  return { 
    ...taxResult,
    soleInfo: {
      taxType: BUSINESS_TYPES.SOLE,
      isSimplified: businessInfo.isSimplified,
      industry: businessInfo.industry
    }
  };
};






