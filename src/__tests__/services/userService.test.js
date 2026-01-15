import mongoose from 'mongoose';
import * as userService from '../../services/userService.js';
import { User } from '../../models/User.js';

describe('userService', () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } catch (error) {
      console.error('MongoDB 연결 실패:', error);
      throw error;
    }
  }, 30000); // 타임아웃 30초로 설정

  beforeEach(async () => {
    try {
      await User.deleteMany({});
    } catch (error) {
      console.error('데이터 초기화 실패:', error);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      await User.deleteMany({});
    } catch (error) {
      console.error('데이터 정리 실패:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await mongoose.disconnect();
    } catch (error) {
      console.error('MongoDB 연결 해제 실패:', error);
      throw error;
    }
  });

  it('should create and get user', async () => {
    const kakaoId = 'test_user';
    const user = await userService.getOrCreateUser(kakaoId);
    expect(user).not.toBeNull();
    expect(user.kakaoId).toBe(kakaoId);
  }, 10000);

  it('should update business info', async () => {
    const kakaoId = 'test_user_2';
    const businessInfo = { businessNumber: '1234567890', representativeName: '홍길동', openDate: '20220101', companyName: '테스트' };
    const user = await userService.updateBusinessInfo(kakaoId, businessInfo);
    expect(user.businessInfo.businessNumber).toBe('1234567890');
  }, 10000);

  it('should update notification settings', async () => {
    const kakaoId = 'test123';
    const settings = { enabled: true, time: '09:00' };
    
    // 먼저 사용자 생성
    const createdUser = await userService.getOrCreateUser(kakaoId);
    expect(createdUser).not.toBeNull();
    
    const user = await userService.updateNotificationSettings(kakaoId, settings);
    expect(user).not.toBeNull();
    expect(user.preferences.notifications.enabled).toBe(true);
    expect(user.preferences.notifications.time).toBe('09:00');
  }, 10000);

  it('should return null for non-existent user', async () => {
    const user = await userService.getUserInfo('nonexistent_user');
    expect(user).toBeNull();
  }, 10000);
}); 