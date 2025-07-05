import Joi from 'joi';

export const familyMemberSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().optional(),
  dietaryRestrictions: Joi.array().items(Joi.number().integer().positive()).optional(),
  cuisinePreferences: Joi.array().items(
    Joi.object({
      cuisineId: Joi.number().integer().positive().required(),
      preferenceLevel: Joi.number().integer().min(1).max(5).required(),
    })
  ).optional(),
});

export const updateFamilyMemberSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
  dietaryRestrictions: Joi.array().items(Joi.number().integer().positive()).optional(),
  cuisinePreferences: Joi.array().items(
    Joi.object({
      cuisineId: Joi.number().integer().positive().required(),
      preferenceLevel: Joi.number().integer().min(1).max(5).required(),
    })
  ).optional(),
});

export const restaurantSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  address: Joi.string().optional(),
  phone: Joi.string().max(20).optional(),
  cuisineId: Joi.number().integer().positive().optional(),
  priceRange: Joi.number().integer().min(1).max(4).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  website: Joi.string().uri().optional(),
  notes: Joi.string().optional(),
  dietaryAccommodations: Joi.array().items(
    Joi.object({
      dietaryRestrictionId: Joi.number().integer().positive().required(),
      notes: Joi.string().optional(),
    })
  ).optional(),
});

export const updateRestaurantSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  address: Joi.string().optional(),
  phone: Joi.string().max(20).optional(),
  cuisineId: Joi.number().integer().positive().optional(),
  priceRange: Joi.number().integer().min(1).max(4).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  website: Joi.string().uri().optional(),
  notes: Joi.string().optional(),
  dietaryAccommodations: Joi.array().items(
    Joi.object({
      dietaryRestrictionId: Joi.number().integer().positive().required(),
      notes: Joi.string().optional(),
    })
  ).optional(),
});

export const recommendationSchema = Joi.object({
  memberIds: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
  filters: Joi.object({
    maxPriceRange: Joi.number().integer().min(1).max(4).optional(),
    minRating: Joi.number().min(0).max(5).optional(),
    cuisineIds: Joi.array().items(Joi.number().integer().positive()).optional(),
  }).optional(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const restaurantQuerySchema = Joi.object({
  cuisine: Joi.number().integer().positive().optional(),
  dietary: Joi.number().integer().positive().optional(),
  rating: Joi.number().min(0).max(5).optional(),
});