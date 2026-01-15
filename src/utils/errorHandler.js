/**
 * 글로벌 에러 핸들러 미들웨어
 */
export const errorHandler = (err, req, res, next) => {
  // 에러 로깅
  console.error(`에러 발생: ${err.message}`);
  console.error(err.stack);

  // 상태 코드 설정 (기본값 500)
  const statusCode = err.status || 500;
  
  // 클라이언트에게 에러 응답
  res.status(statusCode).json({
    success: false,
    message: err.message || '서버 내부 오류가 발생했습니다',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}; 