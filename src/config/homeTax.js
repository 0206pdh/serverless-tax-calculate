import dotenv from 'dotenv';

dotenv.config();

export const API_CONFIG = {
  BASE_URL: 'https://api.odcloud.kr/api/nts-businessman/v1',
  STATUS_ENDPOINT: '/status',
  VALIDATE_ENDPOINT: '/validate',
  SERVICE_KEY: decodeURIComponent(process.env.BUSINESS_API_KEY)
};

export const STATUS_MAP = {
  '01': '계속사업자',
  '02': '휴업자',
  '03': '폐업자',
  '04': '단위사업장폐업자'
};

export const TAX_TYPE_MAP = {
  '01': '일반과세자',
  '02': '간이과세자',
  '03': '면세사업자',
  '04': '과세특례자',
  '05': '간이과세 면세사업자'
}; 