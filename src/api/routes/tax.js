import express from 'express';
import * as taxController from '../controllers/taxController.js';

const router = express.Router();

// 부가가치세 계산
router.post('/vat', taxController.calculateVAT);

// 소득세 계산
router.post('/income', taxController.calculateIncomeTax);

// 근로소득세 계산
router.post('/labor', taxController.calculateLaborTax);

// 법인세 납부 일정 조회
router.post('/schedule/corporation', taxController.getCorporationTaxSchedule);

// 개인사업자 세금 납부 일정 조회
router.post('/schedule/sole', taxController.getSoleTaxSchedule);

export default router; 