import express from 'express';
import calcRoutes from './calc.js';

const router = express.Router();

router.use('/calc', calcRoutes);

export default router;
