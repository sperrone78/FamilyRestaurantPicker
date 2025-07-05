import express from 'express';
import { RestaurantModel } from '../models/Restaurant';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { restaurantSchema, updateRestaurantSchema, idParamSchema, restaurantQuerySchema } from '../validation/schemas';
import { createError } from '../middleware/errorHandler';
import { ApiResponse, Restaurant } from '../types';

const router = express.Router();

router.get('/', validateQuery(restaurantQuerySchema), async (req, res: express.Response<ApiResponse<Restaurant[]>>, next) => {
  try {
    const filters = {
      cuisine: req.query.cuisine ? parseInt(req.query.cuisine as string) : undefined,
      dietary: req.query.dietary ? parseInt(req.query.dietary as string) : undefined,
      rating: req.query.rating ? parseFloat(req.query.rating as string) : undefined,
    };

    const restaurants = await RestaurantModel.findAll(filters);
    res.json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateParams(idParamSchema), async (req, res: express.Response<ApiResponse<Restaurant>>, next) => {
  try {
    const id = parseInt(req.params.id);
    const restaurant = await RestaurantModel.findById(id);
    
    if (!restaurant) {
      throw createError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }
    
    res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateRequest(restaurantSchema), async (req, res: express.Response<ApiResponse<Restaurant>>, next) => {
  try {
    const restaurant = await RestaurantModel.create(req.body);
    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', 
  validateParams(idParamSchema),
  validateRequest(updateRestaurantSchema),
  async (req, res: express.Response<ApiResponse<Restaurant>>, next) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await RestaurantModel.update(id, req.body);
      
      if (!restaurant) {
        throw createError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
      }
      
      res.json({
        success: true,
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', validateParams(idParamSchema), async (req, res: express.Response<ApiResponse<{ message: string }>>, next) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await RestaurantModel.delete(id);
    
    if (!deleted) {
      throw createError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }
    
    res.json({
      success: true,
      data: { message: 'Restaurant deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;