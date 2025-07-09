import { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { restaurantsService, favoritesService } from '../services/firestore';

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

  // Combine restaurants with user favorites data using useMemo
  const restaurantsWithUserData = useMemo(() => {
    if (!restaurants || restaurants.length === 0) {
      return [];
    }

    const favoriteRestaurantIds = new Set(userFavorites.map(f => f.restaurantId));

    return restaurants.map(restaurant => ({
      ...restaurant,
      isFavorite: favoriteRestaurantIds.has(restaurant.id)
    }));
  }, [restaurants, userFavorites]);

  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, boolean>>({});

  // Apply optimistic updates to the computed data
  const finalRestaurantsWithUserData = useMemo(() => {
    return restaurantsWithUserData.map(restaurant => ({
      ...restaurant,
      isFavorite: optimisticUpdates[restaurant.id] !== undefined 
        ? optimisticUpdates[restaurant.id] 
        : restaurant.isFavorite
    }));
  }, [restaurantsWithUserData, optimisticUpdates]);

  const updateFavoriteStatus = (restaurantId: string, isFavorite: boolean) => {
    setOptimisticUpdates(prev => ({
      ...prev,
      [restaurantId]: isFavorite
    }));
  };

  const clearOptimisticUpdate = (restaurantId: string) => {
    setOptimisticUpdates(prev => {
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
    clearOptimisticUpdate
  };
}