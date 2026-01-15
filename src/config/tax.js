export const TAX_RATES = {
  VAT: 0.1,
  INCOME_TAX: {
    TIER1: { max: 12000000, rate: 0.06 },
    TIER2: { max: 46000000, rate: 0.15 },
    TIER3: { max: 88000000, rate: 0.24 },
    TIER4: { max: 150000000, rate: 0.35 },
    TIER5: { max: 300000000, rate: 0.38 },
    TIER6: { max: 500000000, rate: 0.4 },
    TIER7: { max: Infinity, rate: 0.42 }
  },
  LOCAL_INCOME_TAX: 0.1,
  TAX_CREDIT: 0.55,
  SIMPLIFIED_VAT: 0.03
};

export const SIMPLIFIED_VAT_RATES = {
  RETAIL: 0.015,
  FOOD_LODGING: 0.03,
  MANUFACTURING_CONSTRUCTION: 0.025,
  SERVICE: 0.04
};

export const TAX_SCHEDULES = {
  CORPORATION: {
    VAT: {
      title: 'VAT',
      description: '1st half: 4/1-7/25, 2nd half: 10/1-1/25'
    },
    WITHHOLDING: {
      title: 'Withholding',
      description: 'Monthly: 10th, Semiannual: 7/10 and 1/10'
    },
    CORPORATE: {
      title: 'Corporate Tax',
      description: 'By period: 3/31, 6/30, 9/30, 12/31'
    }
  },
  SOLE: {
    INCOME: {
      title: 'Income Tax',
      description: 'Filing window: 5/1-5/31'
    },
    VAT: {
      title: 'VAT',
      description: '1st half: 7/1-7/25, 2nd half: 1/1-1/25'
    },
    WITHHOLDING: {
      title: 'Withholding',
      description: 'Monthly: 10th, Semiannual: 7/10 and 1/10'
    }
  }
};

export const TAX_CALCULATION = {
  DEDUCTION_LIMITS: {
    INSURANCE: 1200000,
    MEDICAL: 1500000,
    EDUCATION: 300000,
    DONATION: 1000000,
    RETIREMENT: 900000
  },
  TAX_REDUCTIONS: {
    STARTUP: 0.5,
    RESEARCH: 0.3,
    INVESTMENT: 0.2
  },
  OPTIONS: {
    ROUND_DECIMALS: 0,
    MIN_TAX_AMOUNT: 1000,
    MAX_DEDUCTION_RATE: 0.7
  }
};

export const BUSINESS_TYPES = {
  CORPORATION: 'CORPORATION',
  SOLE: 'SOLE'
};

export const TAX_TYPES = {
  VAT: 'VAT',
  INCOME: 'INCOME',
  CORPORATE: 'CORPORATE',
  WITHHOLDING: 'WITHHOLDING'
};
