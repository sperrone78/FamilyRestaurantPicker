import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  FamilyMember, 
  CreateFamilyMemberRequest, 
  UpdateFamilyMemberRequest,
  Restaurant,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  DietaryRestriction,
  Cuisine,
  RestaurantFavorite,
  RestaurantComment,
  CreateCommentRequest,
  UpdateCommentRequest,
  PersonalRating,
  CreatePersonalRatingRequest,
  UpdatePersonalRatingRequest
} from '../types';

// Family Members
export const familyMembersService = {
  async getAll(familyId: string): Promise<FamilyMember[]> {
    const q = query(
      collection(db, 'familyMembers'),
      where('familyId', '==', familyId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FamilyMember));
  },

  async create(data: CreateFamilyMemberRequest & { familyId: string }): Promise<FamilyMember> {
    // Check current family size before adding new member
    const currentMembersQuery = query(
      collection(db, 'familyMembers'),
      where('familyId', '==', data.familyId)
    );
    const currentMembersSnapshot = await getDocs(currentMembersQuery);
    
    if (currentMembersSnapshot.size >= 10) {
      throw new Error('Family size limit reached (maximum 10 members)');
    }

    const docRef = await addDoc(collection(db, 'familyMembers'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const doc = await getDoc(docRef);
    return {
      id: doc.id,
      ...doc.data()
    } as FamilyMember;
  },

  async update(id: string, data: UpdateFamilyMemberRequest): Promise<FamilyMember> {
    const docRef = doc(db, 'familyMembers', id);
    
    // Filter out undefined values to prevent Firestore errors (including nested)
    const filterUndefined = (obj: any): any => {
      if (obj === null || obj === undefined) return null;
      if (Array.isArray(obj)) {
        return obj.filter(item => item !== undefined).map(filterUndefined);
      }
      if (typeof obj === 'object') {
        const filtered: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            filtered[key] = filterUndefined(value);
          }
        }
        return filtered;
      }
      return obj;
    };
    
    const updateData = filterUndefined(data);
    
    console.log('Updating family member:', { id, originalData: data, filteredData: updateData });
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as FamilyMember;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'familyMembers', id));
  }
};

// Restaurants
export const restaurantsService = {
  async getAll(): Promise<Restaurant[]> {
    const q = query(
      collection(db, 'restaurants'),
      orderBy('rating', 'desc')
    );

    const snapshot = await getDocs(q);
    
    // Get all cuisines to populate cuisine data
    const cuisines = await referenceDataService.getCuisines();
    const cuisineMap = new Map(cuisines.map(c => [c.id, c]));
    
    // Get all dietary restrictions to populate accommodations
    const dietaryRestrictions = await referenceDataService.getDietaryRestrictions();
    const dietaryMap = new Map(dietaryRestrictions.map(d => [d.id, d]));
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Populate cuisine objects from cuisineIds (new) or cuisineId (backward compatibility)
      let cuisine: any = undefined;
      let cuisines: any[] = [];
      
      if (data.cuisineIds && Array.isArray(data.cuisineIds)) {
        // New format: multiple cuisines
        cuisines = data.cuisineIds
          .map((id: string) => cuisineMap.get(id))
          .filter(Boolean);
        // Keep first cuisine for backward compatibility
        cuisine = cuisines[0];
      } else if (data.cuisineId) {
        // Old format: single cuisine
        cuisine = cuisineMap.get(data.cuisineId);
        cuisines = cuisine ? [cuisine] : [];
      }
      
      // Populate dietary accommodations (stored as array of objects with dietaryRestrictionId)
      const dietaryAccommodations = data.dietaryAccommodations 
        ? data.dietaryAccommodations.map((accommodation: any) => {
            const restrictionId = accommodation.dietaryRestrictionId || accommodation;
            const restriction = dietaryMap.get(restrictionId);
            return restriction ? { 
              id: restriction.id, 
              name: restriction.name, 
              notes: accommodation.notes || restriction.description 
            } : null;
          }).filter(Boolean)
        : [];
      
      return {
        id: doc.id,
        ...data,
        cuisine,
        cuisines,
        dietaryAccommodations
      } as Restaurant;
    });
  },

  async create(data: CreateRestaurantRequest): Promise<Restaurant> {
    // Transform cuisines array to cuisineIds for storage
    const transformedData = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      cuisineIds: data.cuisines, // Store as array of IDs
      priceRange: data.priceRange,
      rating: data.rating,
      website: data.website,
      notes: data.notes,
      dietaryAccommodations: data.dietaryAccommodations?.map(acc => ({
        dietaryRestrictionId: acc.dietaryRestrictionId,
        notes: acc.notes
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'restaurants'), transformedData);
    const doc = await getDoc(docRef);
    return {
      id: doc.id,
      ...doc.data()
    } as Restaurant;
  },

  async update(id: string, data: UpdateRestaurantRequest): Promise<Restaurant> {
    const docRef = doc(db, 'restaurants', id);
    
    // Transform the data similar to create
    const transformedData: any = {};
    
    if (data.name !== undefined) transformedData.name = data.name;
    if (data.address !== undefined) transformedData.address = data.address;
    if (data.phone !== undefined) transformedData.phone = data.phone;
    if (data.cuisines !== undefined) transformedData.cuisineIds = data.cuisines;
    if (data.priceRange !== undefined) transformedData.priceRange = data.priceRange;
    if (data.rating !== undefined) transformedData.rating = data.rating;
    if (data.website !== undefined) transformedData.website = data.website;
    if (data.notes !== undefined) transformedData.notes = data.notes;
    if (data.dietaryAccommodations !== undefined) {
      transformedData.dietaryAccommodations = data.dietaryAccommodations?.map(acc => ({
        dietaryRestrictionId: acc.dietaryRestrictionId,
        notes: acc.notes
      }));
    }
    
    await updateDoc(docRef, {
      ...transformedData,
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Restaurant;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'restaurants', id));
  }
};

// Restaurant Favorites
export const favoritesService = {
  async getUserFavorites(userId: string): Promise<RestaurantFavorite[]> {
    const q = query(
      collection(db, 'restaurantFavorites'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RestaurantFavorite));
  },

  async isFavorite(userId: string, restaurantId: string): Promise<boolean> {
    const q = query(
      collection(db, 'restaurantFavorites'),
      where('userId', '==', userId),
      where('restaurantId', '==', restaurantId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  async addFavorite(userId: string, restaurantId: string): Promise<RestaurantFavorite> {
    const docRef = await addDoc(collection(db, 'restaurantFavorites'), {
      userId,
      restaurantId,
      createdAt: new Date().toISOString()
    });

    const doc = await getDoc(docRef);
    return {
      id: doc.id,
      ...doc.data()
    } as RestaurantFavorite;
  },

  async removeFavorite(userId: string, restaurantId: string): Promise<void> {
    const q = query(
      collection(db, 'restaurantFavorites'),
      where('userId', '==', userId),
      where('restaurantId', '==', restaurantId)
    );
    
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(promises);
  }
};

// Restaurant Comments
export const commentsService = {
  async getRestaurantComments(restaurantId: string, userId: string): Promise<RestaurantComment[]> {
    const q = query(
      collection(db, 'restaurantComments'),
      where('restaurantId', '==', restaurantId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RestaurantComment));
  },

  async getUserComments(userId: string): Promise<RestaurantComment[]> {
    const q = query(
      collection(db, 'restaurantComments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RestaurantComment));
  },

  async addComment(userId: string, data: CreateCommentRequest): Promise<RestaurantComment> {
    const docRef = await addDoc(collection(db, 'restaurantComments'), {
      userId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const doc = await getDoc(docRef);
    return {
      id: doc.id,
      ...doc.data()
    } as RestaurantComment;
  },

  async updateComment(commentId: string, data: UpdateCommentRequest): Promise<RestaurantComment> {
    const docRef = doc(db, 'restaurantComments', commentId);
    
    // Filter out undefined values to prevent Firestore errors
    const updateData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as RestaurantComment;
  },

  async deleteComment(commentId: string): Promise<void> {
    await deleteDoc(doc(db, 'restaurantComments', commentId));
  }
};

// Personal Ratings
export const personalRatingsService = {
  async getUserRatings(userId: string): Promise<PersonalRating[]> {
    const q = query(
      collection(db, 'personalRatings'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PersonalRating));
  },

  async getRestaurantRating(userId: string, restaurantId: string): Promise<PersonalRating | null> {
    const q = query(
      collection(db, 'personalRatings'),
      where('userId', '==', userId),
      where('restaurantId', '==', restaurantId)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as PersonalRating;
  },

  async setRating(userId: string, data: CreatePersonalRatingRequest): Promise<PersonalRating> {
    // Check if rating already exists
    const existing = await this.getRestaurantRating(userId, data.restaurantId);
    
    if (existing) {
      // Update existing rating
      return this.updateRating(existing.id, { rating: data.rating });
    } else {
      // Create new rating
      const docRef = await addDoc(collection(db, 'personalRatings'), {
        userId,
        restaurantId: data.restaurantId,
        rating: data.rating,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const doc = await getDoc(docRef);
      return {
        id: doc.id,
        ...doc.data()
      } as PersonalRating;
    }
  },

  async updateRating(ratingId: string, data: UpdatePersonalRatingRequest): Promise<PersonalRating> {
    const docRef = doc(db, 'personalRatings', ratingId);
    
    await updateDoc(docRef, {
      rating: data.rating,
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as PersonalRating;
  },

  async removeRating(ratingId: string): Promise<void> {
    await deleteDoc(doc(db, 'personalRatings', ratingId));
  }
};

// Reference Data
export const referenceDataService = {
  async getDietaryRestrictions(): Promise<DietaryRestriction[]> {
    const snapshot = await getDocs(collection(db, 'dietaryRestrictions'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DietaryRestriction));
  },

  async getCuisines(): Promise<Cuisine[]> {
    const snapshot = await getDocs(collection(db, 'cuisines'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Cuisine));
  }
};