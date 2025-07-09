import express from 'express';
import { CuisineModel } from '../models/Cuisine';
import { ApiResponse, Cuisine } from '../types';

const router = express.Router();

router.get('/', async (_req, res: express.Response<ApiResponse<Cuisine[]>>, next) => {
  try {
    const cuisines = await CuisineModel.findAll();
    res.json({
      success: true,
      data: cuisines,
    });
  } catch (error) {
    next(error);
  }
});

export default router;