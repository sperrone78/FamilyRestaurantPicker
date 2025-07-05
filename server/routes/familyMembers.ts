import express from 'express';
import { FamilyMemberModel } from '../models/FamilyMember';
import { validateRequest, validateParams } from '../middleware/validation';
import { familyMemberSchema, updateFamilyMemberSchema, idParamSchema } from '../validation/schemas';
import { createError } from '../middleware/errorHandler';
import { ApiResponse, FamilyMember } from '../types';

const router = express.Router();

router.get('/', async (req, res: express.Response<ApiResponse<FamilyMember[]>>, next) => {
  try {
    const members = await FamilyMemberModel.findAll();
    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateParams(idParamSchema), async (req, res: express.Response<ApiResponse<FamilyMember>>, next) => {
  try {
    const id = parseInt(req.params.id);
    const member = await FamilyMemberModel.findById(id);
    
    if (!member) {
      throw createError('Family member not found', 404, 'MEMBER_NOT_FOUND');
    }
    
    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateRequest(familyMemberSchema), async (req, res: express.Response<ApiResponse<FamilyMember>>, next) => {
  try {
    const member = await FamilyMemberModel.create(req.body);
    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', 
  validateParams(idParamSchema),
  validateRequest(updateFamilyMemberSchema),
  async (req, res: express.Response<ApiResponse<FamilyMember>>, next) => {
    try {
      const id = parseInt(req.params.id);
      const member = await FamilyMemberModel.update(id, req.body);
      
      if (!member) {
        throw createError('Family member not found', 404, 'MEMBER_NOT_FOUND');
      }
      
      res.json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', validateParams(idParamSchema), async (req, res: express.Response<ApiResponse<{ message: string }>>, next) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await FamilyMemberModel.delete(id);
    
    if (!deleted) {
      throw createError('Family member not found', 404, 'MEMBER_NOT_FOUND');
    }
    
    res.json({
      success: true,
      data: { message: 'Family member deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;