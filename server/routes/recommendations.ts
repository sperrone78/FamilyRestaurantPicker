import express from 'express';
import { RecommendationService } from '../services/RecommendationService';
import { validateRequest } from '../middleware/validation';
import { recommendationSchema } from '../validation/schemas';
import { ApiResponse, RecommendationResponse } from '../types';

const router = express.Router();

router.post('/', validateRequest(recommendationSchema), async (req, res: express.Response<ApiResponse<RecommendationResponse>>, next) => {
  try {
    const recommendations = await RecommendationService.generateRecommendations(req.body);
    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
});

export default router;