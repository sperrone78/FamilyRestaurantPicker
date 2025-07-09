#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'family-restaurant-picker'
});

const db = admin.firestore();

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID: node scripts/cleanup-non-bloomington-restaurants.js YOUR_USER_ID');
  process.exit(1);
}

// Restaurants that are not actually in Bloomington-Normal IL area
const restaurantsToRemove = [
  'Jerusalem Restaurant',
  'Ephesus Turkish & Mediterranean Cuisine'
];

async function cleanupNonBloomingtonRestaurants() {
  try {
    console.log('🧹 Starting cleanup of non-Bloomington restaurants...');
    console.log(`👤 Using familyId: ${userId}`);
    
    let removedCount = 0;
    let notFoundCount = 0;
    
    for (const restaurantName of restaurantsToRemove) {
      try {
        // Find the restaurant
        const query = await db.collection('restaurants')
          .where('name', '==', restaurantName)
          .where('familyId', '==', userId)
          .get();
        
        if (query.empty) {
          console.log(`⚠️  Restaurant not found: ${restaurantName}`);
          notFoundCount++;
          continue;
        }
        
        // Delete the restaurant(s)
        for (const doc of query.docs) {
          await doc.ref.delete();
          console.log(`❌ Removed: ${restaurantName} (ID: ${doc.id})`);
          removedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to remove ${restaurantName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Cleanup completed! Removed ${removedCount} restaurants, ${notFoundCount} not found.`);
    
    // Show updated count
    const allRestaurants = await db.collection('restaurants')
      .where('familyId', '==', userId)
      .get();
    
    console.log(`📊 Total restaurants remaining: ${allRestaurants.size}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
cleanupNonBloomingtonRestaurants();