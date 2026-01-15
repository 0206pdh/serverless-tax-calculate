import * as taxService from '../../services/taxService.js';
import * as userService from '../../services/userService.js';
import { createKakaoResponse } from '../../utils/kakao.js';

// 상수 정의
const ERROR_MESSAGES = {
  NO_BUSINESS_INFO: '사업자 정보가 등록되지 않았습니다.',
  INVALID_INPUT: '유효하지 않은 입력값입니다.',
};

// 세율 정의
const TAX_RATES = {
  VAT: 0.1, // 10%
  INCOME_TAX: {
    TIER1: { max: 12000000, rate: 0.06 },
    TIER2: { max: 46000000, rate: 0.15 },
    TIER3: { max: 88000000, rate: 0.24 },
    TIER4: { max: 150000000, rate: 0.35 },
    TIER5: { max: 300000000, rate: 0.38 },
    TIER6: { max: 500000000, rate: 0.4 },
    TIER7: { max: Infinity, rate: 0.42 },
  },
};

/**
 * 세금 계산
 */
export const calculateTax = async (req, res, next) => {
  try {
    const { income, deductions } = req.query;

    // 입력값 검증
    if (!income) {
      return res.status(400).json({
        success: false,
        message: '소득은 필수 항목입니다.',
      });
    }

    // 세금 계산 서비스 호출
    const result = await taxService.calculateTax(Number(income), deductions);

    // 결과 반환
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 세금 환급 계산
 */
export const calculateRefund = async (req, res, next) => {
  try {
    const { income, paidTax, deductions } = req.query;

    // 입력값 검증
    if (!income || !paidTax) {
      return res.status(400).json({
        success: false,
        message: '소득과 결제한 세금은 필수 항목입니다.',
      });
    }

    // 세금 환급 계산 서비스 호출
    const result = await taxService.calculateRefund(
      Number(income),
      Number(paidTax),
      deductions
    );

    // 결과 반환
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 부가가치세 계산
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 */
export const calculateVAT = async (req, res) => {
  try {
    const kakaoId = req.body.userRequest.user.id;
    
    // 사용자 정보 조회
    const user = await userService.getUserInfo(kakaoId);
    if (!user?.businessInfo) {
      return res.json(createKakaoResponse(
        "사업자 정보가 등록되지 않았습니다. 먼저 사업자 정보를 등록해주세요."
      ));
    }

    const salesInfo = {
      totalSales: 100000000,    // 총 매출액
      totalPurchases: 60000000, // 총 매입액
      nonTaxableSales: 5000000  // 비과세 매출액
    };

    const result = await taxService.calculateVAT({
      salesInfo,
      businessInfo: user.businessInfo
    });

    // 카카오톡 응답 포맷
    const response = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: `💰 ${result.businessInfo.companyName} 부가가치세 계산 결과\n\n` +
                    `📊 총 매출액: ${result.summary.totalSales.toLocaleString()}원\n` +
                    `💵 총 매입액: ${result.summary.totalPurchases.toLocaleString()}원\n` +
                    `📝 과세표준액: ${result.summary.taxableAmount.toLocaleString()}원\n\n` +
                    `💸 세금 내역\n` +
                    `• 매출세액: ${result.summary.outputTax.toLocaleString()}원\n` +
                    `• 매입세액: ${result.summary.inputTax.toLocaleString()}원\n` +
                    `• 부가가치세: ${result.summary.vatAmount.toLocaleString()}원`
            }
          },
          {
            simpleText: {
              text: `📋 상세 내역\n\n` +
                    `• 과세 매출액: ${result.details.taxableSales.toLocaleString()}원\n` +
                    `• 비과세 매출액: ${result.details.nonTaxableSales.toLocaleString()}원\n` +
                    `• 공급가액: ${result.details.supplyAmount.toLocaleString()}원\n\n` +
                    `💡 세율 정보\n` +
                    `• 적용 세율: ${result.summary.taxRate}%\n` +
                    `• 과세 유형: ${result.businessInfo.taxType === 'CORPORATION' ? '법인' : '개인'} ${result.businessInfo.isSimplified ? '(간이과세)' : '(일반과세)'}`
            }
          }
        ],
        quickReplies: [
          {
            messageText: "다른 매출로 계산하기",
            action: "message",
            label: "다른 매출로 계산하기"
          },
          {
            messageText: "세금 계산 도움말",
            action: "message",
            label: "세금 계산 도움말"
          }
        ]
      }
    };

    res.json(response);
  } catch (error) {
    console.error('[calculateVAT] Error:', error);
    res.json(createKakaoResponse(
      "부가가치세 계산 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    ));
  }
};
/**
 * 종합소득세 계산
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 */
export const calculateIncomeTax = async (req, res) => {
  try {
    const kakaoId = req.body.userRequest.user.id;
    
    // 사용자 정보 조회
    const user = await userService.getUserInfo(kakaoId);
    if (!user?.businessInfo) {
      return res.json(createKakaoResponse(
        "사업자 정보가 등록되지 않았습니다. 먼저 사업자 정보를 등록해주세요."
      ));
    }

    const incomeInfo = {
      businessIncome: 50000000,    // 사업소득
      otherIncome: 10000000,       // 기타소득
      capitalGains: 5000000,       // 양도소득
      interestIncome: 2000000,     // 이자소득
      dividendIncome: 3000000      // 배당소득
    };

    const deductions = {
      insurance: 1200000,          // 보험료 공제
      medical: 800000,             // 의료비 공제
      education: 300000,           // 교육비 공제
      donation: 500000,            // 기부금 공제
      retirement: 1000000,         // 퇴직연금 공제
      other: 200000                // 기타 공제
    };

    const result = await taxService.calculateIncomeTax({
      incomeInfo,
      deductions,
      businessInfo: user.businessInfo
    });

    // 카카오톡 응답 포맷
    const response = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: `💰 ${result.businessInfo.companyName} 종합소득세 계산 결과\n\n` +
                    `📊 총 수입금액: ${result.summary.totalIncome.toLocaleString()}원\n` +
                    `💵 총 공제액: ${result.summary.totalDeductions.toLocaleString()}원\n` +
                    `📝 과세표준액: ${result.summary.taxableIncome.toLocaleString()}원\n\n` +
                    `💸 세금 내역\n` +
                    `• 종합소득세: ${result.summary.incomeTax.toLocaleString()}원\n` +
                    `• 지방소득세: ${result.summary.localIncomeTax.toLocaleString()}원\n` +
                    `• 세액공제: ${result.summary.taxCredit.toLocaleString()}원\n` +
                    `• 최종 세액: ${result.summary.finalTax.toLocaleString()}원`
            }
          },
          {
            simpleText: {
              text: `📋 소득 내역\n\n` +
                    `• 사업소득: ${result.details.income.businessIncome.toLocaleString()}원\n` +
                    `• 기타소득: ${result.details.income.otherIncome.toLocaleString()}원\n` +
                    `• 양도소득: ${result.details.income.capitalGains.toLocaleString()}원\n` +
                    `• 이자소득: ${result.details.income.interestIncome.toLocaleString()}원\n` +
                    `• 배당소득: ${result.details.income.dividendIncome.toLocaleString()}원\n\n` +
                    `💡 공제 내역\n` +
                    `• 보험료: ${result.details.deductions.insurance.toLocaleString()}원\n` +
                    `• 의료비: ${result.details.deductions.medical.toLocaleString()}원\n` +
                    `• 교육비: ${result.details.deductions.education.toLocaleString()}원\n` +
                    `• 기부금: ${result.details.deductions.donation.toLocaleString()}원\n` +
                    `• 퇴직연금: ${result.details.deductions.retirement.toLocaleString()}원\n` +
                    `• 기타: ${result.details.deductions.other.toLocaleString()}원\n\n` +
                    `📊 세율 정보\n` +
                    `• 종합소득세율: ${result.summary.taxRate}%\n` +
                    `• 지방소득세율: 10%`
            }
          }
        ],
        quickReplies: [
          {
            messageText: "다른 소득으로 계산하기",
            action: "message",
            label: "다른 소득으로 계산하기"
          },
          {
            messageText: "세금 계산 도움말",
            action: "message",
            label: "세금 계산 도움말"
          }
        ]
      }
    };

    res.json(response);
  } catch (error) {
    console.error('[calculateIncomeTax] Error:', error);
    res.json(createKakaoResponse(
      "종합소득세 계산 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    ));
  }
};

/**
 * 인건비 세금 계산 (근로소득세 + 4대보험료 + 지방소득세)
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 */
export const calculateLaborTax = async (req, res) => {
  try {
    const kakaoId = req.body.userRequest.user.id;
    const { salaryInfo } = req.body;

    // 사용자 정보 조회
    const user = await userService.getUserInfo(kakaoId);
    if (!user?.businessInfo) {
      return res.json(createKakaoResponse(
        "사업자 정보가 등록되지 않았습니다. 먼저 사업자 정보를 등록해주세요."
      ));
    }

    // 기본값 설정
    const deductions = {
      insurance: 0,    // 보험료 공제
      medical: 0,      // 의료비 공제
      education: 0,    // 교육비 공제
      other: 0         // 기타 공제
    };

    const result = await taxService.calculateLaborTax({
      monthlySalary: salaryInfo?.monthlySalary || 0,
      bonus: salaryInfo?.bonus || 0,
      nonTaxableAllowance: salaryInfo?.nonTaxableAllowance || 0,
      deductions,
      businessInfo: user.businessInfo
    });

    // 카카오톡 응답 포맷
    const response = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: `💰 ${result.businessInfo.companyName} 인건비 세금 계산 결과\n\n` +
                    `📊 월 급여: ${(result.monthly?.salary || 0).toLocaleString()}원\n` +
                    `💵 실수령액: ${(result.monthly?.netSalary || 0).toLocaleString()}원\n\n` +
                    `📝 공제 내역\n` +
                    `• 4대보험료: ${(result.monthly?.insurance || 0).toLocaleString()}원\n` +
                    `• 근로소득세: ${(result.monthly?.incomeTax || 0).toLocaleString()}원\n` +
                    `• 지방소득세: ${(result.monthly?.localIncomeTax || 0).toLocaleString()}원`
            }
          },
          {
            simpleText: {
              text: `📋 상세 내역\n\n` +
                    `• 국민연금: ${(result.details?.insurance?.nationalPension || 0).toLocaleString()}원\n` +
                    `• 건강보험: ${(result.details?.insurance?.healthInsurance || 0).toLocaleString()}원\n` +
                    `• 장기요양: ${(result.details?.insurance?.longTermCare || 0).toLocaleString()}원\n` +
                    `• 고용보험: ${(result.details?.insurance?.employmentInsurance || 0).toLocaleString()}원\n\n` +
                    `💡 공제 내역\n` +
                    `• 보험료: ${(result.details?.deductions?.insurance || 0).toLocaleString()}원\n` +
                    `• 의료비: ${(result.details?.deductions?.medical || 0).toLocaleString()}원\n` +
                    `• 교육비: ${(result.details?.deductions?.education || 0).toLocaleString()}원\n` +
                    `• 기타: ${(result.details?.deductions?.other || 0).toLocaleString()}원`
            }
          }
        ],
        quickReplies: [
          {
            messageText: "다른 급여로 계산하기",
            action: "message",
            label: "다른 급여로 계산하기"
          },
          {
            messageText: "세금 계산 도움말",
            action: "message",
            label: "세금 계산 도움말"
          }
        ]
      }
    };

    res.json(response);
  } catch (error) {
    console.error('[calculateLaborTax] Error:', error);
    res.json(createKakaoResponse(
      "인건비 세금 계산 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    ));
  }
};

/**
 * 매입세액 계산
 */
export const calculateInputVAT = async (req, res) => {
  try {
    const kakaoId = req.body.userRequest.user.id;
    const { income, expenses } = req.body;

    // // 입력값 검증
    // if (!income || !expenses) {
    //   return res.status(400).json({
    //     success: false,
    //     error: ERROR_MESSAGES.INVALID_INPUT,
    //   });
    // }

    // // 사용자 정보 조회
    // const user = await userService.getUserInfo(kakaoId);
    // if (!user?.businessInfo) {
    //   return res.status(400).json({
    //     success: false,
    //     error: ERROR_MESSAGES.NO_BUSINESS_INFO,
    //   });
    // }

    const c = new soleTaxCalculate({
      taxBase: 52000000, // 과세표준 (예시)
      totalSales: 95000000, // 연 매출
      totalWages: 3000000 + 2500000, // 총 급여: 두 직원 합산
      hasEmployee: true, // 직원 있음
      vatType: null, // 자동판단: 연매출 기준
      businessType: '도소매업', // 업종
      purchaseAmount: 30000000, // 연간 매입액
      employees: [
        {
          name: '직원1',
          salary: 3000000,
          contractType: '정규직',
        },
        {
          name: '직원2',
          salary: 2500000,
          contractType: '정규직',
        },
      ],
    });

    //매입세액 계산
    let inputVAT = c.splitVATIncludedAmount(c.purchaseAmount);

    const text =
      `✅ 매입세액 계산 결과\n\n` +
      `• 매입세액: ${Math.round(inputVAT).toLocaleString()}원\n` +
      `• 매입액: ${Math.round(c.purchaseAmount).toLocaleString()}원\n`;

    return res.json(createKakaoResponse(text));
  } catch (error) {
    console.error('[calculateInputVAT] Error:', error);
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 법인사업자 세금 신고 일정 조회
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 */
export const getCorporationTaxSchedule = async (req, res) => {
  try {
    const schedule = {
      version: "2.0",
      template: {
        outputs: [
          {
            listCard: {
              header: {
                title: "법인사업자 세금 신고 안내"
              },
              items: [
                {
                  title: "📌 부가가치세",
                  description: "1기: 4.1~7.25 / 2기: 10.1~다음해 1.25",
                  link: {
                    web: "#"
                  }
                },
                {
                  title: "📌 원천세",
                  description: "매월: 다음 달 10일 / 반기: 7.10, 1.10",
                  link: {
                    web: "#"
                  }
                },
                {
                  title: "📌 법인세",
                  description: "결산월별: 3/31, 6/30, 9/30, 12/31",
                  link: {
                    web: "#"
                  }
                }
              ],
              buttons: [
                {
                  label: "자세히 보기",
                  action: "webLink",
                  webLinkUrl: "#"
                }
              ]
            }
          }
        ]
      }
    };

    res.json(schedule);
  } catch (error) {
    console.error('[getCorporationTaxSchedule] Error:', error);
    res.json(createKakaoResponse(
      "세금 신고 일정 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    ));
  }
};

/**
 * 개인사업자 세금 신고 일정 조회
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 */
export const getSoleTaxSchedule = async (req, res) => {
  try {    
    const schedule = {
      version: "2.0",
      template: {
        outputs: [
          {
            listCard: {
              header: {
                title: "개인사업자 세금 신고 안내"
              },
              items: [
                {
                  title: "📌 종합소득세",
                  description: "신고기간: 5월 1일 ~ 5월 31일",
                  link: {
                    web: "#"
                  }
                },
                {
                  title: "📌 부가가치세",
                  description: "1기: 7.1 ~ 7.25 / 2기: 다음해 1.1 ~ 1.25",
                  link: {
                    web: "#"
                  }
                },
                {
                  title: "📌 원천세",
                  description: "매월: 다음달 10일 / 반기: 7.10, 1.10",
                  link: {
                    web: "#"
                  }
                }
              ],
              buttons: [
                {
                  label: "자세히 보기",
                  action: "webLink",
                  webLinkUrl: "#"
                }
              ]
            }
          }
        ]
      }
    };

    res.json(schedule);
  } catch (error) {
    console.error('[getSoleTaxSchedule] Error:', error);
    res.json(createKakaoResponse(
      "세금 신고 일정 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    ));
  }
};
