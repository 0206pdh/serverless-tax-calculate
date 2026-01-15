import express from 'express';
import * as businessInfoController from '../controllers/businessInfoController.js';

const router = express.Router();

// 사업자 정보 검증
router.post('/validate', businessInfoController.validateBusinessInfoForKakao);

// 사업자 정보 조회
router.post('/info/get', businessInfoController.getBusinessInfo);

// 사업자 정보 업데이트
router.post('/info/update', businessInfoController.updateBusinessInfo);

export default router;