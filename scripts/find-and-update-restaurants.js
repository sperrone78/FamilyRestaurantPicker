#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'family-restaurant-picker'
});

const db = admin.firestore();

const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID: node scripts/find-and-update-restaurants.js YOUR_USER_ID');
  process.exit(1);
}

async function findAndUpdateRestaurants() {
  try {
    console.log('🔍 Searching for restaurants in your family...');
    
    // Get all restaurants for this family
    const restaurantsQuery = await db.collection('restaurants')
      .where('familyId', '==', userId)
      .get();
    
    console.log(`📊 Found ${restaurantsQuery.size} restaurants for family ${userId}`);
    
    // Look for restaurants that match our target names (fuzzy matching)
    const targetRestaurants = [];
    
    restaurantsQuery.forEach(doc => {
      const data = doc.data();
      const name = data.name || '';
      
      if (name.toLowerCase().includes('theo') && name.toLowerCase().includes('microcreamery')) {
        targetRestaurants.push({
          id: doc.id,
          name: name,
          currentCuisineId: data.cuisineId,
          targetCuisine: 'Dessert & Ice Cream',
          targetCuisineId: '0Z6li14BvbMVjvdWeOfQ'
        });
      }
      
      if (name.toLowerCase().includes('ivy') && name.toLowerCase().includes('lane')) {
        targetRestaurants.push({
          id: doc.id,
          name: name,
          currentCuisineId: data.cuisineId,
          targetCuisine: 'Bakery & Pastries',
          targetCuisineId: 'EddcONUzIhZWZooJpJM5'
        });
      }
    });
    
    if (targetRestaurants.length === 0) {
      console.log('❌ No matching restaurants found. Here are all your restaurants:');
      restaurantsQuery.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name} (Cuisine ID: ${data.cuisineId})`);
      });
      return;
    }
    
    console.log(`✅ Found ${targetRestaurants.length} restaurants to update:`);
    targetRestaurants.forEach(r => {
      console.log(`   - ${r.name} → ${r.targetCuisine}`);
    });
    
    // Update the restaurants
    for (const restaurant of targetRestaurants) {
      try {
        await db.collection('restaurants').doc(restaurant.id).update({
          cuisineId: restaurant.targetCuisineId,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ Updated: ${restaurant.name} → ${restaurant.targetCuisine}`);
      } catch (error) {
        console.error(`❌ Failed to update ${restaurant.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Restaurant categorization complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

findAndUpdateRestaurants();