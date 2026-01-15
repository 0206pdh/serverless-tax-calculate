// 카카오톡 스킬 버전
export const KAKAO_SKILL_VERSION = '2.0';

// 기본 퀵리플라이
export const DEFAULT_QUICK_REPLIES = [
  {
    messageText: "다시 검증하기",
    action: "message",
    label: "다시 검증하기"
  },
  {
    messageText: "도움말",
    action: "message",
    label: "도움말"
  }
];

/**
 * 카카오톡 응답 포맷 생성
 * @param {string} text - 응답 메시지
 * @param {Array} quickReplies - 퀵리플라이 목록
 * @returns {Object} 카카오톡 응답 포맷
 */
export const createKakaoResponse = (text, quickReplies = DEFAULT_QUICK_REPLIES) => ({
  version: KAKAO_SKILL_VERSION,
  template: {
    outputs: [{ simpleText: { text } }],
    quickReplies
  }
}); 