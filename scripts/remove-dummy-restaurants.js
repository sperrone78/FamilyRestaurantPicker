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
  console.error('❌ Please provide a user ID: node scripts/remove-dummy-restaurants.js YOUR_USER_ID');
  process.exit(1);
}

// Dummy test restaurants to remove
const dummyRestaurants = [
  'Green Leaf Cafe',
  'Veggie Delight', 
  'Pizza Palace',
  'Ocean Breeze',
  'Spice Garden'
];

async function removeDummyRestaurants() {
  try {
    console.log('🧹 Starting removal of dummy test restaurants...');
    console.log(`👤 Using familyId: ${userId}`);
    
    let removedCount = 0;
    let notFoundCount = 0;
    
    for (const restaurantName of dummyRestaurants) {
      try {
        // Find the restaurant
        const query = await db.collection('restaurants')
          .where('name', '==', restaurantName)
          .where('familyId', '==', userId)
          .get();
        
        if (query.empty) {
          console.log(`⚠️  Dummy restaurant not found: ${restaurantName}`);
          notFoundCount++;
          continue;
        }
        
        // Delete the restaurant(s)
        for (const doc of query.docs) {
          await doc.ref.delete();
          console.log(`❌ Removed dummy restaurant: ${restaurantName} (ID: ${doc.id})`);
          removedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to remove ${restaurantName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Cleanup completed! Removed ${removedCount} dummy restaurants, ${notFoundCount} not found.`);
    
    // Show updated count
    const allRestaurants = await db.collection('restaurants')
      .where('familyId', '==', userId)
      .get();
    
    console.log(`📊 Total restaurants remaining: ${allRestaurants.size}`);
    
    if (allRestaurants.size > 0) {
      console.log('\n🏪 Remaining restaurants:');
      allRestaurants.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during dummy restaurant removal:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
removeDummyRestaurants();