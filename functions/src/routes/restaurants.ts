import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { AuthenticatedRequest } from '../middleware/auth';
import { FamilyService } from '../services/familyService';

const router = express.Router();
const db = getFirestore();

// Get all restaurants for user's family
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

    let query = db
      .collection('restaurants')
      .where('familyId', '==', family.id);

    // Apply filters if provided
    const { cuisine, dietary, rating } = req.query;
    
    if (cuisine) {
      query = query.where('cuisine.id', '==', cuisine as string);
    }
    
    if (rating) {
      query = query.where('rating', '>=', parseFloat(rating as string));
    }

    const restaurantsSnapshot = await query
      .orderBy('rating', 'desc')
      .orderBy('name', 'asc')
      .get();

    let restaurants = restaurantsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by dietary restrictions if specified (client-side filtering for complex queries)
    if (dietary) {
      restaurants = restaurants.filter(restaurant => 
        restaurant.dietaryAccommodations?.some((acc: any) => acc.id === dietary)
      );
    }

    res.json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  }
});

// Create new restaurant
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const family = await FamilyService.getUserPrimaryFamily(userId);
    
    if (!family) {
      return res.status(404).json({
        success: false,
        error: { message: 'No family found', code: 'FAMILY_NOT_FOUND' }
      });
    }

    const restaurantRef = db.collection('restaurants').doc();
    const restaurantData = {
      ...req.body,
      familyId: family.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await restaurantRef.set(restaurantData);

    res.status(201).json({
      success: true,
      data: {
        id: restaurantRef.id,
        ...restaurantData
      }
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  }
});

// Update restaurant
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const restaurantId = req.params.id;
    const family = await FamilyService.getUserPrimaryFamily(userId);
    
    if (!family) {
      return res.status(404).json({
        success: false,
        error: { message: 'No family found', code: 'FAMILY_NOT_FOUND' }
      });
    }

    const restaurantRef = db.collection('restaurants').doc(restaurantId);
    const restaurantDoc = await restaurantRef.get();

    if (!restaurantDoc.exists || restaurantDoc.data()?.familyId !== family.id) {
      return res.status(404).json({
        success: false,
        error: { message: 'Restaurant not found', code: 'RESTAURANT_NOT_FOUND' }
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await restaurantRef.update(updateData);

    const updatedDoc = await restaurantRef.get();
    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  }
});

// Delete restaurant
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const restaurantId = req.params.id;
    const family = await FamilyService.getUserPrimaryFamily(userId);
    
    if (!family) {
      return res.status(404).json({
        success: false,
        error: { message: 'No family found', code: 'FAMILY_NOT_FOUND' }
      });
    }

    const restaurantRef = db.collection('restaurants').doc(restaurantId);
    const restaurantDoc = await restaurantRef.get();

    if (!restaurantDoc.exists || restaurantDoc.data()?.familyId !== family.id) {
      return res.status(404).json({
        success: false,
        error: { message: 'Restaurant not found', code: 'RESTAURANT_NOT_FOUND' }
      });
    }

    await restaurantRef.delete();

    res.json({
      success: true,
      data: { message: 'Restaurant deleted successfully' }
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  }
});

export { router as restaurantsRouter };