import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/security.js';
import { createError } from '../utils/error.js';

// JWT 토큰 검증 미들웨어
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw createError(401, '인증 토큰이 필요합니다.');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(createError(401, '유효하지 않은 토큰입니다.'));
  }
};

// 역할 기반 접근 제어 미들웨어
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, '인증이 필요합니다.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, '접근 권한이 없습니다.'));
    }

    next();
  };
};

// 요청 제한 미들웨어
export const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15분
  const maxRequests = 100; // 최대 요청 수

  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = new Map();
  }

  const userRequests = req.app.locals.rateLimit.get(ip) || [];
  const validRequests = userRequests.filter(time => now - time < windowMs);

  if (validRequests.length >= maxRequests) {
    return next(createError(429, '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'));
  }

  validRequests.push(now);
  req.app.locals.rateLimit.set(ip, validRequests);
  next();
};

// XSS 방지 미들웨어
export const xssProtection = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      if (typeof value === 'string') {
        acc[key] = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      } else if (typeof value === 'object') {
        acc[key] = sanitize(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, Array.isArray(obj) ? [] : {});
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

// CORS 설정 미들웨어
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24시간
}; 