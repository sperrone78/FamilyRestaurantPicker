import Joi from 'joi';

// Family Member validation schemas
export const createFamilyMemberSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z\s\-'\.]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
      'string.max': 'Name cannot exceed 100 characters',
      'string.min': 'Name is required'
    }),
  
  email: Joi.string()
    .trim()
    .email()
    .max(254)
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.max': 'Email cannot exceed 254 characters'
    }),
  
  dietaryRestrictions: Joi.array()
    .items(Joi.string().uuid())
    .max(20)
    .optional()
    .default([])
    .messages({
      'array.max': 'Cannot have more than 20 dietary restrictions'
    }),
  
  cuisinePreferences: Joi.array()
    .items(Joi.object({
      cuisineId: Joi.string().uuid().required(),
      preferenceLevel: Joi.number().integer().min(1).max(5).required()
    }))
    .max(50)
    .optional()
    .default([])
    .messages({
      'array.max': 'Cannot have more than 50 cuisine preferences'
    })
});

export const updateFamilyMemberSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z\s\-'\.]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
      'string.max': 'Name cannot exceed 100 characters',
      'string.min': 'Name cannot be empty'
    }),
  
  email: Joi.string()
    .trim()
    .email()
    .max(254)
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.max': 'Email cannot exceed 254 characters'
    }),
  
  dietaryRestrictions: Joi.array()
    .items(Joi.string().uuid())
    .max(20)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 20 dietary restrictions'
    }),
  
  cuisinePreferences: Joi.array()
    .items(Joi.object({
      cuisineId: Joi.string().uuid().required(),
      preferenceLevel: Joi.number().integer().min(1).max(5).required()
    }))
    .max(50)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 50 cuisine preferences'
    })
});

// Comment validation schemas
export const createCommentSchema = Joi.object({
  restaurantId: Joi.string()
    .uuid()
    .required(),
  
  content: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.max': 'Comment cannot exceed 500 characters',
      'string.min': 'Comment cannot be empty'
    })
});

export const updateCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.max': 'Comment cannot exceed 500 characters',
      'string.min': 'Comment cannot be empty'
    })
});

// General validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errorMessages
        }
      });
    }
    
    req.body = value;
    next();
  };
};