import crypto from 'crypto';

// JWT 시크릿 키
export const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// 비밀번호 해싱 설정
export const PASSWORD_CONFIG = {
  saltRounds: 10,
  algorithm: 'sha256',
  iterations: 10000,
  keylen: 64
};

// 세션 설정
export const SESSION_CONFIG = {
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
};

// 암호화 설정
export const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  key: process.env.ENCRYPTION_KEY || crypto.randomBytes(32),
  ivLength: 16,
  saltLength: 64
};

// 보안 헤더 설정
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}; 