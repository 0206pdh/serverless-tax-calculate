// 커스텀 에러 클래스
export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 에러 생성 헬퍼 함수
export const createError = (statusCode, message) => {
  return new AppError(statusCode, message);
};

// 에러 메시지 상수
export const ERROR_MESSAGES = {
  // 인증 관련
  AUTH: {
    INVALID_TOKEN: '유효하지 않은 토큰입니다.',
    TOKEN_EXPIRED: '토큰이 만료되었습니다.',
    UNAUTHORIZED: '인증이 필요합니다.',
    FORBIDDEN: '접근 권한이 없습니다.',
    INVALID_CREDENTIALS: '잘못된 인증 정보입니다.',
    NO_BUSINESS_INFO: '사업자 정보가 등록되지 않았습니다.',
    INVALID_BUSINESS_TYPE: {
      CORPORATION: '법인사업자만 조회 가능한 서비스입니다.',
      SOLE: '개인사업자만 조회 가능한 서비스입니다.'
    }
  },
  
  // 입력값 검증
  VALIDATION: {
    INVALID_INPUT: '유효하지 않은 입력값입니다.',
    MISSING_REQUIRED: '필수 입력값이 누락되었습니다.',
    INVALID_FORMAT: '잘못된 형식입니다.',
    INVALID_AMOUNT: '유효하지 않은 금액입니다.',
    INVALID_DATE: '유효하지 않은 날짜입니다.',
    INVALID_BUSINESS_NUMBER: '유효하지 않은 사업자등록번호입니다.'
  },
  
  // 비즈니스 로직
  BUSINESS: {
    NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
    ALREADY_EXISTS: '이미 존재하는 리소스입니다.',
    INVALID_OPERATION: '유효하지 않은 작업입니다.',
    TAX_CALCULATION_ERROR: '세금 계산 중 오류가 발생했습니다.',
    INVALID_TAX_TYPE: '유효하지 않은 세금 유형입니다.',
    INVALID_DEDUCTION: '유효하지 않은 공제 항목입니다.'
  },
  
  // 시스템
  SYSTEM: {
    INTERNAL_ERROR: '내부 서버 오류가 발생했습니다.',
    SERVICE_UNAVAILABLE: '서비스를 일시적으로 이용할 수 없습니다.',
    DATABASE_ERROR: '데이터베이스 오류가 발생했습니다.',
    EXTERNAL_API_ERROR: '외부 API 호출 중 오류가 발생했습니다.',
    FILE_PROCESSING_ERROR: '파일 처리 중 오류가 발생했습니다.'
  }
};

// 에러 핸들러 미들웨어
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 개발 환경에서는 상세 에러 정보 제공
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  // 프로덕션 환경에서는 제한된 정보만 제공
  else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // 프로그래밍 에러는 클라이언트에게 상세 정보를 숨김
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: '알 수 없는 오류가 발생했습니다.'
      });
    }
  }
};

// 비동기 에러 래퍼
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 입력값 검증 에러
export const validationError = (errors) => {
  return new AppError(400, {
    message: '입력값 검증에 실패했습니다.',
    errors
  });
}; 