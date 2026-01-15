import axios from 'axios';
import { API_CONFIG, STATUS_MAP, TAX_TYPE_MAP } from '../config/homeTax.js';
import { ERROR_MESSAGES } from '../utils/error.js';

/**
 * API 요청 헬퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 데이터
 * @returns {Promise<Object>} API 응답
 */
const makeApiRequest = async (endpoint, data) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `${API_CONFIG.BASE_URL}${endpoint}`,
      params: { serviceKey: API_CONFIG.SERVICE_KEY },
      headers: { 'Content-Type': 'application/json' },
      data
    });

    if (!response.data?.data?.length) {
      throw new Error(ERROR_MESSAGES.API_ERROR);
    }

    return response.data.data[0];
  } catch (error) {
    console.error(`[API 요청 실패] ${endpoint}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * 사업자 번호 정리
 * @param {string} businessNumber - 사업자등록번호
 * @returns {string} 정리된 사업자등록번호
 */
const cleanBusinessNumber = (businessNumber) => {
  const cleaned = businessNumber.replace(/-/g, '');
  if (!/^\d{10}$/.test(cleaned)) {
    throw new Error(ERROR_MESSAGES.INVALID_FORMAT);
  }
  return cleaned;
};

/**
 * 개업일자 정리
 * @param {string} openDate - 개업일자
 * @returns {string} 정리된 개업일자
 */
const cleanOpenDate = (openDate) => {
  const cleaned = openDate.replace(/-/g, '');
  if (!/^\d{8}$/.test(cleaned)) {
    throw new Error(ERROR_MESSAGES.INVALID_FORMAT);
  }
  return cleaned;
};

/**
 * 사업자 정보 조회
 * @param {string} businessNumber - 사업자등록번호
 * @returns {Promise<Object>} 사업자 정보
 */
export const getBusinessInfo = async (businessNumber) => {
  try {
    const cleanNumber = cleanBusinessNumber(businessNumber);
    const businessData = await makeApiRequest(API_CONFIG.STATUS_ENDPOINT, {
      b_no: [cleanNumber]
    });

    // 미등록 사업자 처리
    if (businessData.tax_type === '국세청에 등록되지 않은 사업자등록번호입니다.') {
      return {
        businessNumber: cleanNumber,
        valid: false,
        companyName: '미등록 사업자',
        representative: '정보없음',
        businessType: '정보없음',
        address: '정보없음',
        status: '미등록',
        taxType: '정보없음',
        lastCheckedDate: new Date().toISOString(),
        rawData: businessData
      };
    }

    return {
      businessNumber: cleanNumber,
      valid: businessData.b_stt_cd !== '',
      companyName: businessData.b_nm || '정보없음',
      representative: '정보없음',
      businessType: businessData.b_sector || '정보없음',
      address: '정보없음',
      status: STATUS_MAP[businessData.b_stt_cd] || businessData.b_stt_cd || '정보없음',
      taxType: TAX_TYPE_MAP[businessData.tax_type_cd] || businessData.tax_type || '정보없음',
      lastCheckedDate: new Date().toISOString(),
      rawData: businessData
    };
  } catch (error) {
    // 개발 환경에서만 더미 데이터 반환
    if (process.env.NODE_ENV !== 'production') {
      console.warn('API 호출 실패, 더미 데이터 반환');
      return {
        businessNumber: businessNumber.replace(/-/g, ''),
        valid: true,
        companyName: '세금도우미 주식회사 (더미)',
        representative: '홍길동',
        businessType: '서비스업',
        address: '서울특별시 강남구 테헤란로 123',
        establishmentDate: '2020-01-01',
        status: '계속사업자',
        taxType: '일반과세자',
        lastCheckedDate: new Date().toISOString(),
        isDummy: true
      };
    }
    throw error;
  }
};

/**
 * 사업자 정보 진위확인
 * @param {Object} businessInfo - 사업자 정보
 * @param {string} businessInfo.businessNumber - 사업자등록번호
 * @param {string} businessInfo.representativeName - 대표자명
 * @param {string} businessInfo.openDate - 개업일자
 * @param {string} [businessInfo.companyName] - 회사명
 * @returns {Promise<Object>} 진위확인 결과
 */
export const validateBusinessInfo = async (businessInfo) => {
  try {
    let { businessNumber, representativeName, openDate, companyName } = businessInfo;
    openDate = openDate.replace(/-/g, '');

    // 필수 입력값 검증
    if (!businessNumber || !representativeName || !openDate) {
      throw new Error(ERROR_MESSAGES.MISSING_FIELDS);
    }

    const cleanNumber = cleanBusinessNumber(businessNumber);
    const cleanDate = cleanOpenDate(openDate);

    const validationResult = await makeApiRequest(API_CONFIG.VALIDATE_ENDPOINT, {
      businesses: [{
        b_no: cleanNumber,
        start_dt: cleanDate,
        p_nm: representativeName,
        b_nm: companyName || '',
        corp_no: '',
        b_sector: '',
        b_type: '',
        p_nm2: '',
        b_adr: ''
      }]
    });

    return {
      businessNumber: cleanNumber,
      valid: validationResult.valid,
      lastCheckedDate: new Date().toISOString(),
      rawData: validationResult
    };
  } catch (error) {
    console.error('[validateBusinessInfo] Error:', error);
    throw error;
  }
}; 