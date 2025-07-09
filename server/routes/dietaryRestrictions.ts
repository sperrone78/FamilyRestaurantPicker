import express from 'express';
import { DietaryRestrictionModel } from '../models/DietaryRestriction';
import { ApiResponse, DietaryRestriction } from '../types';

const router = express.Router();

router.get('/', async (_req, res: express.Response<ApiResponse<DietaryRestriction[]>>, next) => {
  try {
    const restrictions = await DietaryRestrictionModel.findAll();
    res.json({
      success: true,
      data: restrictions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;