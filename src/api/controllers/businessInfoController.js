import * as businessInfoService from '../../services/businessInfoService.js';
import * as userService from '../../services/userService.js';
import { validateBusinessInfo } from '../../utils/validators.js';
import { createKakaoResponse } from '../../utils/kakao.js';
import { ERROR_MESSAGES } from '../../utils/error.js';

/**
 * 검증 메시지 생성
 * @param {Object} data - 검증 결과 데이터
 * @returns {string} 검증 메시지
 */
const generateValidationMessage = (data) => {
  if (data.rawData?.status) {
    const { b_stt, tax_type } = data.rawData.status;
    return `${b_stt}이며, ${tax_type}입니다.`;
  }
  return data.valid
    ? "등록되어 있는 사업자등록번호입니다."
    : "등록되지 않은 사업자등록번호입니다.";
};

/**
 * 검증 응답 포맷팅
 * @param {Object} data - 검증 결과 데이터
 * @param {string} message - 검증 메시지
 * @returns {string} 포맷팅된 응답 메시지
 */
const formatValidationResponse = (data, message) => {
  const prefix = data.valid ? '✅' : '❌';
  const timestamp = new Date(data.lastCheckedDate).toLocaleString();
  return `${prefix} ${message}\n\n사업자등록번호: ${data.businessNumber}\n검증일시: ${timestamp}`;
};

/**
 * 사업자 정보 조회
 * @param {Object} req
 * @param {Object} res
 */
export const getBusinessInfo = async (req, res) => {
  try {
    const kakaoId = req.body.userRequest.user.id;
    const user = await userService.getUserInfo(kakaoId);
    
    if (!user?.businessInfo) {
      return res.json(createKakaoResponse(
        "사업자 정보가 등록되지 않았습니다. 먼저 사업자 정보를 등록해주세요."
      ));
    }

    const displayInfo = (info) => info || '미입력';
    const formatOpenDate = (date) => date ? new Date(date).toLocaleDateString() : '미입력';

    return res.json(createKakaoResponse(
      `🏢 회사명 / 👤 대표자\n→ ${displayInfo(user.businessInfo.companyName)} / ${displayInfo(user.businessInfo.representativeName)}\n\n` +
      `📂 분류 (업태/종목)\n→ ${displayInfo(user.businessInfo.businessType)} / ${displayInfo(user.businessInfo.businessCategory)}\n\n` +
      `📅 개업일\n→ ${formatOpenDate(user.businessInfo.openDate)}\n\n` +
      `📍 소재지\n→ ${displayInfo(user.businessInfo.address)}\n\n` +
      `🔒 법인등록번호\n→ ${displayInfo(user.businessInfo.corporationNumber)}\n\n` +
      `💰 과세 유형\n→ ${displayInfo(user.businessInfo.taxType)}`
    ));
  } catch (error) {
    console.error('[getBusinessInfo] Error:', error);
    return res.json(createKakaoResponse(ERROR_MESSAGES.VALIDATION.INVALID_INPUT));
  }
};

/**
 * 사업자 정보 진위확인
 * @param {Object} req
 * @param {Object} res
 */
export const validateBusinessInfoForKakao = async (req, res) => {
  try {
    const { utterance } = req.body.userRequest;
    const businessInfo = utterance.split('/');

    // 유효성 검사
    const validationResult = validateBusinessInfo(businessInfo);
    if (!validationResult.isValid) {
      return res.json(createKakaoResponse(validationResult.error));
    }

    // 사업자 정보 진위확인 서비스 호출
    const data = await businessInfoService.validateBusinessInfo({
      businessNumber: businessInfo[0],
      representativeName: businessInfo[1],
      openDate: businessInfo[2],
      companyName: businessInfo[3]
    });
    
    // 검증 메시지 생성 및 응답
    const validationMessage = generateValidationMessage(data);
    const message = formatValidationResponse(data, validationMessage);
    
    return res.json(createKakaoResponse(message));
  } catch (error) {
    console.error('[validateBusinessInfoForKakao] Error:', error);
    return res.json(createKakaoResponse(ERROR_MESSAGES.VALIDATION.INVALID_INPUT));
  }
};

/**
 * 사업자 정보 업데이트
 * @param {Object} req
 * @param {Object} res
 */
export const updateBusinessInfo = async (req, res) => {
  try {
    const kakaoId = req.body.userRequest.user.id;
    let {businessNumber, representativeName, openDate, companyName, corporationNumber, businessType, businessCategory, taxType, address} = req.body.action.params;
    openDate = JSON.parse(openDate).value;

    const businessInfo = [businessNumber, representativeName, openDate, companyName, corporationNumber, businessType, businessCategory, taxType, address];

    // 유효성 검사
    const validationResult = validateBusinessInfo(businessInfo);
    if (!validationResult.isValid) {
      return res.json(createKakaoResponse(validationResult.error));
    }

    const user = await userService.updateBusinessInfo(kakaoId, {
      businessNumber: businessInfo[0],
      representativeName: businessInfo[1],
      openDate: businessInfo[2],
      companyName: businessInfo[3],
      corporationNumber: businessInfo[4],
      businessType: businessInfo[5],
      businessCategory: businessInfo[6],
      taxType: businessInfo[7],
      address: businessInfo[8]
    });

    return res.json(createKakaoResponse(
      '✅ 사업자 정보가 성공적으로 업데이트되었습니다.'
    ));
  } catch (error) {
    console.error('[updateBusinessInfo] Error:', error);
    return res.json(createKakaoResponse(ERROR_MESSAGES.VALIDATION.INVALID_INPUT));
  }
};