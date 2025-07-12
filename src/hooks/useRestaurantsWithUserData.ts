import { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { restaurantsService, favoritesService, personalRatingsService } from '../services/firestore';

export function useRestaurantsWithUserData() {
  const { user } = useAuth();

  // Query for restaurants
  const { 
    data: restaurants = [], 
    isLoading: restaurantsLoading, 
    error: restaurantsError 
  } = useQuery('restaurants', restaurantsService.getAll);

  // Query for user favorites
  const { data: userFavorites = [] } = useQuery(
    ['favorites', user?.uid],
    () => {
      if (!user) return [];
      return favoritesService.getUserFavorites(user.uid);
    },
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Query for user personal ratings
  const { data: userRatings = [] } = useQuery(
    ['personalRatings', user?.uid],
    () => {
      if (!user) return [];
      return personalRatingsService.getUserRatings(user.uid);
    },
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Combine restaurants with user favorites and personal ratings data using useMemo
  const restaurantsWithUserData = useMemo(() => {
    if (!restaurants || restaurants.length === 0) {
      return [];
    }

    const favoriteRestaurantIds = new Set(userFavorites.map(f => f.restaurantId));
    const ratingsMap = new Map(userRatings.map(r => [r.restaurantId, r]));

    return restaurants.map(restaurant => ({
      ...restaurant,
      isFavorite: favoriteRestaurantIds.has(restaurant.id),
      personalRating: ratingsMap.get(restaurant.id)
    }));
  }, [restaurants, userFavorites, userRatings]);

  const [optimisticFavorites, setOptimisticFavorites] = useState<Record<string, boolean>>({});
  const [optimisticRatings, setOptimisticRatings] = useState<Record<string, number | null>>({});

  // Apply optimistic updates to the computed data
  const finalRestaurantsWithUserData = useMemo(() => {
    return restaurantsWithUserData.map(restaurant => {
      const updatedRestaurant = { ...restaurant };
      
      // Apply optimistic favorite updates
      if (optimisticFavorites[restaurant.id] !== undefined) {
        updatedRestaurant.isFavorite = optimisticFavorites[restaurant.id];
      }
      
      // Apply optimistic rating updates
      if (optimisticRatings[restaurant.id] !== undefined) {
        const newRating = optimisticRatings[restaurant.id];
        if (newRating === null) {
          // Remove personal rating
          updatedRestaurant.personalRating = undefined;
        } else {
          // Add or update personal rating
          updatedRestaurant.personalRating = {
            id: updatedRestaurant.personalRating?.id || 'temp',
            userId: user?.uid || '',
            restaurantId: restaurant.id,
            rating: newRating,
            createdAt: updatedRestaurant.personalRating?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      return updatedRestaurant;
    });
  }, [restaurantsWithUserData, optimisticFavorites, optimisticRatings, user?.uid]);

  const updateFavoriteStatus = (restaurantId: string, isFavorite: boolean) => {
    setOptimisticFavorites(prev => ({
      ...prev,
      [restaurantId]: isFavorite
    }));
  };

  const updatePersonalRating = (restaurantId: string, rating: number | null) => {
    setOptimisticRatings(prev => ({
      ...prev,
      [restaurantId]: rating
    }));
  };

  const clearOptimisticUpdate = (restaurantId: string) => {
    setOptimisticFavorites(prev => {
      const newUpdates = { ...prev };
      delete newUpdates[restaurantId];
      return newUpdates;
    });
    setOptimisticRatings(prev => {
      const newUpdates = { ...prev };
      delete newUpdates[restaurantId];
      return newUpdates;
    });
  };

  return {
    restaurantsWithUserData: finalRestaurantsWithUserData,
    loading: restaurantsLoading,
    error: restaurantsError,
    updateFavoriteStatus,
    updatePersonalRating,
    clearOptimisticUpdate
  };
}