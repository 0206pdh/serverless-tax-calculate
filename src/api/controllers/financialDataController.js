import * as financialDataService from '../../services/financialDataService.js';

/**
 * 사용자 재무 데이터 조회
 */
export const getData = async (req, res, next) => {
  try {
    const { userId, year } = req.query;
    
    // 입력값 검증
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: '사용자 ID는 필수 항목입니다.' 
      });
    }
    
    // 재무 데이터 서비스 호출
    const data = await financialDataService.getUserFinancialData(userId, year || new Date().getFullYear());
    
    // 결과 반환
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 홈택스에서 재무 데이터 스크래핑
 */
export const scrapeData = async (req, res, next) => {
  try {
    const { userId, credentials } = req.body;
    
    // 입력값 검증
    if (!userId || !credentials || !credentials.username || !credentials.password) {
      return res.status(400).json({ 
        success: false, 
        message: '사용자 ID와 인증 정보가 필요합니다.' 
      });
    }
    
    // 즉시 응답 (장시간 실행 작업이므로)
    res.status(202).json({
      success: true,
      message: '데이터 스크래핑이 시작되었습니다. 잠시 후 데이터를 확인해주세요.'
    });
    
    // 비동기로 스크래핑 실행
    try {
      await financialDataService.scrapeHomeTaxData(userId, credentials);
    } catch (scrapeError) {
      console.error(`스크래핑 오류 (사용자 ID: ${userId}):`, scrapeError);
      // 스크래핑 오류는 사용자에게 직접 노출하지 않고 로그만 남깁니다.
    }
  } catch (error) {
    next(error);
  }
};