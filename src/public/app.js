const API_BASE = window.API_BASE || '';
const modeButtons = document.querySelectorAll('.mode-btn');
const modePanels = document.querySelectorAll('.mode-panel');
const taxButtons = document.querySelectorAll('.tax-btn');
const taxCards = document.querySelectorAll('.card[data-tax]');
const taxGrid = document.querySelector('.tax-grid');

const INDUSTRY_LABELS = {
  RETAIL: '도소매업',
  FOOD_LODGING: '음식/숙박업',
  MANUFACTURING_CONSTRUCTION: '제조/건설업',
  SERVICE: '서비스업'
};

const setActiveMode = (mode) => {
  modeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  modePanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === `mode-${mode}`);
  });
};

const setActiveTax = (tax) => {
  if (!tax) return;
  taxButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tax === tax);
  });
  taxCards.forEach((card) => {
    card.classList.toggle('is-hidden', card.dataset.tax !== tax);
  });
  taxGrid?.classList.add('tax-only');
};

modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => setActiveMode(btn.dataset.mode));
});

taxButtons.forEach((btn) => {
  btn.addEventListener('click', () => setActiveTax(btn.dataset.tax));
});

if (taxButtons.length > 0) {
  setActiveTax(taxButtons[0].dataset.tax);
}

const numberFormatter = new Intl.NumberFormat('ko-KR');

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[char];
  });

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const formatValue = (value, formatType) => {
  if (value === undefined || value === null || value === '') return '-';

  if (formatType === 'bool') {
    return value ? '예' : '아니오';
  }

  if (formatType === 'industry') {
    return INDUSTRY_LABELS[value] || String(value);
  }

  if (formatType === 'refundStatus') {
    return value === 'refund' ? '환급' : '추가 납부';
  }

  if (formatType === 'taxType') {
    return value === 'CORPORATION' ? '법인사업자' : '개인사업자';
  }

  const num = toNumberOrNull(value);

  if (formatType === 'percent' && num !== null) {
    return `${numberFormatter.format(num)}%`;
  }

  if (formatType === 'won' && num !== null) {
    return `${numberFormatter.format(num)}원`;
  }

  if (num !== null) {
    return numberFormatter.format(num);
  }

  return String(value);
};

const rowTemplate = (label, value) => `
  <div class="result-item">
    <span class="result-label">${escapeHtml(label)}</span>
    <span class="result-value">${escapeHtml(value)}</span>
  </div>
`;

const sectionTemplate = (title, rowsHtml) => `
  <div class="result-section">
    <h3>${escapeHtml(title)}</h3>
    <div class="result-grid">
      ${rowsHtml}
    </div>
  </div>
`;

const headerTemplate = (title, status) => `
  <div class="result-header">
    <div class="result-title">${escapeHtml(title)}</div>
    <div class="result-status ${status}">${status === 'error' ? '실패' : '성공'}</div>
  </div>
`;

const renderRows = (rows, source) =>
  rows.map((row) => rowTemplate(row.label, formatValue(source?.[row.key], row.format))).join('');

const renderVatResult = (data) => {
  const summaryRows = [
    { key: 'totalSales', label: '총 매출액', format: 'won' },
    { key: 'totalPurchases', label: '총 매입액', format: 'won' },
    { key: 'taxableAmount', label: '과세표준', format: 'won' },
    { key: 'outputTax', label: '매출세액', format: 'won' },
    { key: 'inputTax', label: '매입세액', format: 'won' },
    { key: 'vatAmount', label: '납부(환급)세액', format: 'won' },
    { key: 'taxRate', label: '적용세율', format: 'percent' },
    { key: 'industryRate', label: '간이과세 업종율', format: 'percent' }
  ];
  const detailRows = [
    { key: 'taxableSales', label: '과세 매출액', format: 'won' },
    { key: 'nonTaxableSales', label: '면세 매출액', format: 'won' },
    { key: 'supplyAmount', label: '공급가액', format: 'won' }
  ];
  const businessRows = [
    { key: 'companyName', label: '상호/회사명' },
    { key: 'businessNumber', label: '사업자등록번호' },
    { key: 'taxType', label: '과세 유형', format: 'taxType' },
    { key: 'industry', label: '업종', format: 'industry' },
    { key: 'isSimplified', label: '간이과세', format: 'bool' }
  ];

  return `
    ${headerTemplate('부가세 계산 결과', 'success')}
    ${sectionTemplate('요약', renderRows(summaryRows, data.summary))}
    ${sectionTemplate('상세', renderRows(detailRows, data.details))}
    ${sectionTemplate('사업자 정보', renderRows(businessRows, data.businessInfo))}
  `;
};

const renderIncomeResult = (data, title = '소득세 계산 결과') => {
  const summaryRows = [
    { key: 'totalIncome', label: '총수입', format: 'won' },
    { key: 'totalDeductions', label: '총공제', format: 'won' },
    { key: 'taxableIncome', label: '과세표준', format: 'won' },
    { key: 'taxRate', label: '적용세율', format: 'percent' },
    { key: 'incomeTax', label: '소득세', format: 'won' },
    { key: 'localIncomeTax', label: '지방소득세', format: 'won' },
    { key: 'taxCredit', label: '세액공제', format: 'won' },
    { key: 'finalTax', label: '최종납부세액', format: 'won' }
  ];
  const incomeRows = [
    { key: 'businessIncome', label: '사업소득', format: 'won' },
    { key: 'otherIncome', label: '기타소득', format: 'won' },
    { key: 'capitalGains', label: '양도소득', format: 'won' },
    { key: 'interestIncome', label: '이자소득', format: 'won' },
    { key: 'dividendIncome', label: '배당소득', format: 'won' }
  ];
  const deductionRows = [
    { key: 'insurance', label: '보험료', format: 'won' },
    { key: 'medical', label: '의료비', format: 'won' },
    { key: 'education', label: '교육비', format: 'won' },
    { key: 'donation', label: '기부금', format: 'won' },
    { key: 'retirement', label: '연금저축', format: 'won' },
    { key: 'other', label: '기타 공제', format: 'won' }
  ];
  const businessRows = [
    { key: 'companyName', label: '상호/회사명' },
    { key: 'businessNumber', label: '사업자등록번호' },
    { key: 'taxType', label: '과세 유형', format: 'taxType' }
  ];

  return `
    ${headerTemplate(title, 'success')}
    ${sectionTemplate('요약', renderRows(summaryRows, data.summary))}
    ${sectionTemplate('수입 상세', renderRows(incomeRows, data.details?.income))}
    ${sectionTemplate('공제 상세', renderRows(deductionRows, data.details?.deductions))}
    ${sectionTemplate('사업자 정보', renderRows(businessRows, data.businessInfo))}
  `;
};

const renderLaborResult = (data) => {
  const summaryRows = [
    { key: 'annualSalary', label: '연봉', format: 'won' },
    { key: 'annualBonus', label: '연간 상여', format: 'won' },
    { key: 'annualNonTaxable', label: '연간 비과세', format: 'won' },
    { key: 'totalDeductions', label: '연간 공제', format: 'won' },
    { key: 'taxableIncome', label: '과세표준', format: 'won' },
    { key: 'incomeTax', label: '소득세', format: 'won' },
    { key: 'localIncomeTax', label: '지방소득세', format: 'won' }
  ];
  const insuranceRows = [
    { key: 'nationalPension', label: '국민연금', format: 'won' },
    { key: 'healthInsurance', label: '건강보험', format: 'won' },
    { key: 'longTermCare', label: '장기요양', format: 'won' },
    { key: 'employmentInsurance', label: '고용보험', format: 'won' },
    { key: 'total', label: '4대보험 합계', format: 'won' }
  ];
  const deductionRows = [
    { key: 'insurance', label: '보험료', format: 'won' },
    { key: 'medical', label: '의료비', format: 'won' },
    { key: 'education', label: '교육비', format: 'won' },
    { key: 'other', label: '기타 공제', format: 'won' },
    { key: 'total', label: '공제 합계', format: 'won' }
  ];
  const monthlyRows = [
    { key: 'incomeTax', label: '월 소득세', format: 'won' },
    { key: 'localIncomeTax', label: '월 지방소득세', format: 'won' },
    { key: 'insurance', label: '월 4대보험', format: 'won' },
    { key: 'totalTax', label: '월 공제 합계', format: 'won' },
    { key: 'netSalary', label: '월 실수령액', format: 'won' }
  ];
  const businessRows = [
    { key: 'companyName', label: '상호/회사명' },
    { key: 'businessNumber', label: '사업자등록번호' },
    { key: 'taxType', label: '과세 유형', format: 'taxType' }
  ];

  return `
    ${headerTemplate('근로소득세 계산 결과', 'success')}
    ${sectionTemplate('연간 요약', renderRows(summaryRows, data.summary))}
    ${sectionTemplate('4대보험 상세', renderRows(insuranceRows, data.details?.insurance))}
    ${sectionTemplate('추가 공제', renderRows(deductionRows, data.details?.deductions))}
    ${sectionTemplate('월 급여 요약', renderRows(monthlyRows, data.monthly))}
    ${sectionTemplate('사업자 정보', renderRows(businessRows, data.businessInfo))}
  `;
};

const renderSimpleTaxResult = (data) => {
  const summaryRows = [
    { key: 'income', label: '총소득', format: 'won' },
    { key: 'totalDeductions', label: '총공제', format: 'won' },
    { key: 'taxableIncome', label: '과세표준', format: 'won' },
    { key: 'tax', label: '산출세액', format: 'won' },
    { key: 'effectiveTaxRate', label: '실효세율' }
  ];

  return `
    ${headerTemplate('종합소득세(간편) 결과', 'success')}
    ${sectionTemplate('요약', renderRows(summaryRows, data))}
  `;
};

const renderRefundResult = (data) => {
  const refundRows = [
    { key: 'paidTax', label: '기납부세액', format: 'won' },
    { key: 'refundAmount', label: '환급/추가 납부액', format: 'won' },
    { key: 'status', label: '정산 결과', format: 'refundStatus' }
  ];
  const summaryRows = [
    { key: 'totalIncome', label: '총수입', format: 'won' },
    { key: 'totalDeductions', label: '총공제', format: 'won' },
    { key: 'taxableIncome', label: '과세표준', format: 'won' },
    { key: 'incomeTax', label: '소득세', format: 'won' },
    { key: 'localIncomeTax', label: '지방소득세', format: 'won' },
    { key: 'taxCredit', label: '세액공제', format: 'won' },
    { key: 'finalTax', label: '최종납부세액', format: 'won' }
  ];
  const businessRows = [
    { key: 'companyName', label: '상호/회사명' },
    { key: 'businessNumber', label: '사업자등록번호' },
    { key: 'taxType', label: '과세 유형', format: 'taxType' }
  ];

  return `
    ${headerTemplate('환급/추가 납부 결과', 'success')}
    ${sectionTemplate('정산', renderRows(refundRows, data))}
    ${sectionTemplate('소득세 요약', renderRows(summaryRows, data.summary))}
    ${sectionTemplate('사업자 정보', renderRows(businessRows, data.businessInfo))}
  `;
};

const renderGenericResult = (data) => {
  const entries = data && typeof data === 'object' ? Object.entries(data) : [];
  const rows = entries.map(([key, value]) => {
    const displayValue =
      value && typeof value === 'object' ? JSON.stringify(value) : formatValue(value);
    return rowTemplate(key, displayValue);
  });

  const body = rows.length
    ? sectionTemplate('결과 요약', rows.join(''))
    : '<p class="result-message">결과가 비어 있습니다.</p>';

  const raw = data ? JSON.stringify(data, null, 2) : '';
  const rawBlock = raw ? `<pre class="result-raw">${escapeHtml(raw)}</pre>` : '';

  return `
    ${headerTemplate('조회 결과', 'success')}
    ${body}
    ${rawBlock}
  `;
};

const formatResult = (target, payload) => {
  if (!target) return;
  target.classList.remove('result-empty');

  if (!payload || typeof payload !== 'object') {
    target.innerHTML = `
      ${headerTemplate('결과', 'error')}
      <p class="result-message">결과를 해석할 수 없습니다.</p>
    `;
    return;
  }

  if (payload.success === false) {
    const message = payload.error || payload.message || '요청 처리에 실패했습니다.';
    target.innerHTML = `
      ${headerTemplate('오류', 'error')}
      <p class="result-message">${escapeHtml(message)}</p>
    `;
    return;
  }

  const data = payload.data ?? payload;
  const summary = data?.summary;

  if (summary?.vatAmount !== undefined || summary?.outputTax !== undefined) {
    target.innerHTML = renderVatResult(data);
    return;
  }

  if (data?.refundAmount !== undefined || data?.paidTax !== undefined) {
    target.innerHTML = renderRefundResult(data);
    return;
  }

  if (summary?.finalTax !== undefined || summary?.taxCredit !== undefined) {
    const title = data?.corporateInfo ? '법인세 계산 결과' : '소득세 계산 결과';
    target.innerHTML = renderIncomeResult(data, title);
    return;
  }

  if (summary?.annualSalary !== undefined || summary?.annualBonus !== undefined) {
    target.innerHTML = renderLaborResult(data);
    return;
  }

  if (data?.tax !== undefined && data?.effectiveTaxRate !== undefined) {
    target.innerHTML = renderSimpleTaxResult(data);
    return;
  }

  target.innerHTML = renderGenericResult(data);
};

const toPayload = (form) => {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  return data;
};

const buildBusinessInfo = (data) => ({
  companyName: data.companyName || 'Unknown',
  businessNumber: data.businessNumber || 'N/A',
  taxType: data.taxType || 'SOLE',
  isSimplified: data.isSimplified === 'on',
  industry: data.industry || 'RETAIL'
});

const buildDeductions = (data) => ({
  insurance: data.insurance,
  medical: data.medical,
  education: data.education,
  donation: data.donation,
  retirement: data.retirement,
  other: data.other
});

const handleCalcForm = async (form) => {
  const endpoint = form.dataset.endpoint;
  const raw = toPayload(form);
  const resultBox = form.parentElement.querySelector('.result');

  let body = {};

  if (endpoint.endsWith('/vat')) {
    body = {
      businessInfo: buildBusinessInfo(raw),
      salesInfo: {
        totalSales: raw.totalSales,
        totalPurchases: raw.totalPurchases,
        nonTaxableSales: raw.nonTaxableSales
      }
    };
  }

  if (endpoint.endsWith('/income')) {
    body = {
      businessInfo: buildBusinessInfo(raw),
      incomeInfo: {
        businessIncome: raw.businessIncome,
        otherIncome: raw.otherIncome,
        capitalGains: raw.capitalGains,
        interestIncome: raw.interestIncome,
        dividendIncome: raw.dividendIncome
      },
      deductions: buildDeductions(raw)
    };
  }

  if (endpoint.endsWith('/labor')) {
    body = {
      businessInfo: buildBusinessInfo(raw),
      salaryInfo: {
        monthlySalary: raw.monthlySalary,
        bonus: raw.bonus,
        nonTaxableAllowance: raw.nonTaxableAllowance
      },
      deductions: {
        insurance: raw.insurance,
        medical: raw.medical,
        education: raw.education,
        other: raw.other
      }
    };
  }

  if (endpoint.endsWith('/tax')) {
    body = {
      income: raw.totalIncome,
      deductions: buildDeductions(raw)
    };
  }

  if (endpoint.endsWith('/refund')) {
    body = {
      businessInfo: buildBusinessInfo(raw),
      income: raw.totalIncome,
      paidTax: raw.paidTax,
      deductions: buildDeductions(raw)
    };
  }

  if (endpoint.endsWith('/corporate')) {
    body = {
      businessInfo: buildBusinessInfo(raw),
      incomeInfo: {
        businessIncome: raw.businessIncome,
        otherIncome: raw.otherIncome,
        capitalGains: raw.capitalGains,
        interestIncome: raw.interestIncome,
        dividendIncome: raw.dividendIncome
      },
      deductions: buildDeductions(raw)
    };
  }

  if (endpoint.endsWith('/sole')) {
    body = {
      businessInfo: buildBusinessInfo(raw),
      incomeInfo: {
        businessIncome: raw.businessIncome,
        otherIncome: raw.otherIncome,
        capitalGains: raw.capitalGains,
        interestIncome: raw.interestIncome,
        dividendIncome: raw.dividendIncome
      },
      deductions: buildDeductions(raw)
    };
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    formatResult(resultBox, payload);
  } catch (error) {
    formatResult(resultBox, { success: false, error: error.message });
  }
};

document.querySelectorAll('.form[data-endpoint]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleCalcForm(form);
  });
});

const noticeModal = document.getElementById('notice-modal');
const noticeConfirm = document.getElementById('notice-confirm');
const noticeSelect = document.getElementById('notice-tax-select');

if (noticeModal && noticeConfirm) {
  noticeConfirm.addEventListener('click', () => {
    const selectedTax = noticeSelect?.value || 'vat';
    noticeModal.classList.add('is-hidden');
    setActiveMode('simple');
    setActiveTax(selectedTax);
    const targetCard = document.querySelector(`.card[data-tax="${selectedTax}"]`);
    targetCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}





