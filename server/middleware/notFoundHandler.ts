import { Request, Response } from 'express';
import { ApiResponse } from '../types';

export const notFoundHandler = (req: Request, res: Response<ApiResponse<never>>) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
};