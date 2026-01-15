import { User } from '../models/User.js';
import * as businessInfoService from './businessInfoService.js';

/**
 * 사용자 정보 조회 또는 생성
 */
export const getOrCreateUser = async (kakaoId) => {
  let user = await User.findOne({ kakaoId });
  
  if (!user) {
    user = new User({ kakaoId });
    await user.save();
  }
  
  return user;
};

/**
 * 사업자 정보 등록/업데이트
 */
export const updateBusinessInfo = async (kakaoId, businessInfo) => {

  // 사업자 정보 검증
  const validationResult = await businessInfoService.validateBusinessInfo(businessInfo);
  if (!validationResult.valid) {
    throw new Error('유효하지 않은 사업자 정보입니다.');
  }
  
  // 사용자 정보 조회 또는 생성
  let user = await User.findOne({ kakaoId });
  if (!user) {
    user = new User({ kakaoId });
  }
  
  user.businessInfo = {
    ...businessInfo,
    ...validationResult.rawData.status,
    lastValidated: new Date()
  };
  
  await user.save();
  return user;
};

/**
 * 사용자 정보 조회
 */
export const getUserInfo = async (kakaoId) => {
  let user = await User.findOne({ kakaoId });
  if (!user) {
    user = new User({ kakaoId });
    await user.save();
  }
  return user;
};

/**
 * 알림 설정 업데이트
 */
export const updateNotificationSettings = async (kakaoId, settings) => {
  let user = await User.findOne({ kakaoId });
  if (!user) {
    user = new User({ kakaoId });
  }
  
  user.preferences = {
    ...user.preferences,
    ...settings
  };
  
  await user.save();
  return user;
}; 