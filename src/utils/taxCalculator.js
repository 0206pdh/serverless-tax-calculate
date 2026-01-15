import { TAX_RATES } from '../config/tax.js';

export const calculateTaxRate = (income) => {
  const tiers = Object.values(TAX_RATES.INCOME_TAX);
  const tier = tiers.find(t => income <= t.max);
  return tier ? tier.rate : tiers[tiers.length - 1].rate;
};


export const calculateVATAmount = ({
  taxableSales,
  totalPurchases,
  isSimplified,
  taxRate = TAX_RATES.VAT
}) => {
  const supplyAmount = Math.floor(taxableSales / 1.1);
  const outputTax = Math.floor(supplyAmount * taxRate);
  const inputTax = isSimplified ? 0 : Math.floor(totalPurchases * taxRate);
  const vatAmount = outputTax - inputTax;
  
  return {
    supplyAmount,
    outputTax,
    inputTax,
    vatAmount
  };
};


export const calculateIncomeTaxAmount = ({
  totalIncome,
  totalDeductions,
  taxRate,
  taxCreditRate = TAX_RATES.TAX_CREDIT
}) => {
  const taxableIncome = totalIncome - totalDeductions;
  const incomeTax = Math.floor(taxableIncome * taxRate);
  const localIncomeTax = Math.floor(incomeTax * TAX_RATES.LOCAL_INCOME_TAX);
  const taxCredit = Math.floor(incomeTax * taxCreditRate);
  const finalTax = incomeTax + localIncomeTax - taxCredit;
  
  return {
    taxableIncome,
    incomeTax,
    localIncomeTax,
    taxCredit,
    finalTax
  };
};


export const calculateLaborTaxAmount = ({
  monthlySalary,
  bonus = 0,
  nonTaxableAllowance = 0,
  deductions = {}
}) => {
  const annual = {
    salary: monthlySalary * 12,
    bonus: bonus,
    nonTaxable: nonTaxableAllowance * 12
  };
  const monthly = {
    nationalPension: Math.floor(monthlySalary * 0.045),
    healthInsurance: Math.floor(monthlySalary * 0.0343),
    longTermCare: Math.floor(monthlySalary * 0.0343 * 0.1227),
    employmentInsurance: Math.floor(monthlySalary * 0.008)
  };
  
  monthly.insurance = monthly.nationalPension + monthly.healthInsurance + 
    monthly.longTermCare + monthly.employmentInsurance;
  const annualDeductions = {
    insurance: deductions.insurance || 0,
    medical: deductions.medical || 0,
    education: deductions.education || 0,
    other: deductions.other || 0
  };
  
  annualDeductions.total = annualDeductions.insurance + annualDeductions.medical + 
    annualDeductions.education + annualDeductions.other + (monthly.insurance * 12);
  annual.taxableIncome = annual.salary + annual.bonus - annual.nonTaxable - annualDeductions.total;
  const taxRate = calculateTaxRate(annual.taxableIncome);
  annual.incomeTax = Math.floor(annual.taxableIncome * taxRate);
  annual.localIncomeTax = Math.floor(annual.incomeTax * TAX_RATES.LOCAL_INCOME_TAX);
  monthly.incomeTax = Math.floor(annual.incomeTax / 12);
  monthly.localIncomeTax = Math.floor(annual.localIncomeTax / 12);
  monthly.totalTax = monthly.incomeTax + monthly.localIncomeTax + monthly.insurance;
  monthly.netSalary = monthlySalary - monthly.totalTax;
  
  return {
    annual,
    monthly
  };
}; 
