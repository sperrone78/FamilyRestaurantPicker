import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response<ApiResponse<never>>,
  next: NextFunction
) => {
  console.error('Error:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let details = err.details;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_DATA_FORMAT';
    message = 'Invalid data format provided';
  } else if (err.message.includes('duplicate key')) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    message = 'Resource already exists';
  } else if (err.message.includes('foreign key')) {
    statusCode = 400;
    code = 'INVALID_REFERENCE';
    message = 'Referenced resource does not exist';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
    },
  });
};

export const createError = (
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: any
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};