import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { AuthenticatedRequest } from '../middleware/auth';
import { FamilyService } from '../services/familyService';
import { validateRequest, createFamilyMemberSchema, updateFamilyMemberSchema } from '../validation/schemas';

const router = express.Router();
const db = getFirestore();

// Get all family members for user's family
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const family = await FamilyService.getUserPrimaryFamily(userId);
    
    if (!family) {
      return res.status(404).json({
        success: false,
        error: { message: 'No family found', code: 'FAMILY_NOT_FOUND' }
      });
    }

    const membersSnapshot = await db
      .collection('familyMembers')
      .where('familyId', '==', family.id)
      .orderBy('createdAt', 'desc')
      .get();

    const members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  }
});

// Create new family member
router.post('/', validateRequest(createFamilyMemberSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const family = await FamilyService.getUserPrimaryFamily(userId);
    
    if (!family) {
      return res.status(404).json({
        success: false,
        error: { message: 'No family found', code: 'FAMILY_NOT_FOUND' }
      });
    }

    // Check current family size
    const currentMembersSnapshot = await db
      .collection('familyMembers')
      .where('familyId', '==', family.id)
      .get();

    if (currentMembersSnapshot.size >= 10) {
      return res.status(400).json({
        success: false,
        error: { message: 'Family size limit reached (maximum 10 members)', code: 'FAMILY_SIZE_LIMIT_EXCEEDED' }
      });
    }

    const { name, email, dietaryRestrictions = [], cuisinePreferences = [] } = req.body;

    const memberRef = db.collection('familyMembers').doc();
    const memberData = {
      familyId: family.id,
      name,
      email: email || null,
      dietaryRestrictions,
      cuisinePreferences,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await memberRef.set(memberData);

    res.status(201).json({
      success: true,
      data: {
        id: memberRef.id,
        ...memberData
      }
    });
  } catch (error) {
    console.error('Error creating family member:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  }
});

// Update family member
router.put('/:id', validateRequest(updateFamilyMemberSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const memberId = req.params.id;
    const family = await FamilyService.getUserPrimaryFamily(userId);
    
    if (!family) {
      return res.status(404).json({
        success: false,
        error: { message: 'No family found', code: 'FAMILY_NOT_FOUND' }
      });
    }

    const memberRef = db.collection('familyMembers').doc(memberId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists || memberDoc.data()?.familyId !== family.id) {
      return res.status(404).json({
        success: false,
        error: { message: 'Family member not found', code: 'MEMBER_NOT_FOUND' }
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await memberRef.update(updateData);

    const updatedDoc = await memberRef.get();
    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  }
});

// Delete family member
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const memberId = req.params.id;
    const family = await FamilyService.getUserPrimaryFamily(userId);
    
    if (!family) {
      return res.status(404).json({
        success: false,
        error: { message: 'No family found', code: 'FAMILY_NOT_FOUND' }
      });
    }

    const memberRef = db.collection('familyMembers').doc(memberId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists || memberDoc.data()?.familyId !== family.id) {
      return res.status(404).json({
        success: false,
        error: { message: 'Family member not found', code: 'MEMBER_NOT_FOUND' }
      });
    }

    await memberRef.delete();

    res.json({
      success: true,
      data: { message: 'Family member deleted successfully' }
    });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  }
});

export { router as familyMembersRouter };