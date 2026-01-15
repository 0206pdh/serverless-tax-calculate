/**
 * 사업자 정보 유효성 검사 결과
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - 유효성 검사 통과 여부
 * @property {string} [error] - 오류 메시지 (유효하지 않은 경우)
 */

/**
 * 사업자 정보 유효성 검사 규칙
 */
const VALIDATION_RULES = {
  BUSINESS_NUMBER: {
    pattern: /^\d{10}$/,
    message: '사업자등록번호는 10자리 숫자여야 합니다.'
  },
  REPRESENTATIVE_NAME: {
    minLength: 2,
    message: '대표자명은 2자 이상이어야 합니다.'
  },
  COMPANY_NAME: {
    minLength: 2,
    message: '회사명은 2자 이상이어야 합니다.'
  }
};

/**
 * 사업자 정보 유효성 검사
 * @param {string[]} businessInfo - [사업자등록번호, 대표자명, 개업일자, 회사명]
 * @returns {ValidationResult} 유효성 검사 결과
 */
export const validateBusinessInfo = (businessInfo) => {
  try {

    const [businessNumber, representativeName, openDate, companyName, corporationNumber, businessType, businessCategory, taxType, address] = businessInfo;

    // 사업자등록번호 검사
    if (!VALIDATION_RULES.BUSINESS_NUMBER.pattern.test(businessNumber)) {
      return {
        isValid: false,
        error: VALIDATION_RULES.BUSINESS_NUMBER.message
      };
    }

    // 대표자명 검사
    if (representativeName.length < VALIDATION_RULES.REPRESENTATIVE_NAME.minLength) {
      return {
        isValid: false,
        error: VALIDATION_RULES.REPRESENTATIVE_NAME.message
      };
    }

    // 회사명 검사
    if (companyName.length < VALIDATION_RULES.COMPANY_NAME.minLength) {
      return {
        isValid: false,
        error: VALIDATION_RULES.COMPANY_NAME.message
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: '유효성 검사 중 오류가 발생했습니다.'
    };
  }
}; 