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
  console.error('❌ Please provide a user ID: node scripts/fix-bbq-cuisine.js YOUR_USER_ID');
  process.exit(1);
}

const bbqRestaurants = [
  'Brass Pig Smoke & Alehouse',
  'Bandana\'s Bar-B-Q'
];

async function fixBBQCuisine() {
  try {
    console.log('🍖 Updating BBQ restaurants to have BBQ cuisine instead of American...');
    console.log(`👤 Using familyId: ${userId}`);
    
    // Get BBQ cuisine ID
    const cuisinesSnapshot = await db.collection('cuisines').where('name', '==', 'BBQ').get();
    
    if (cuisinesSnapshot.empty) {
      console.error('❌ BBQ cuisine not found in database');
      process.exit(1);
    }
    
    const bbqCuisineId = cuisinesSnapshot.docs[0].id;
    console.log(`🔧 BBQ cuisine ID: ${bbqCuisineId}`);
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const restaurantName of bbqRestaurants) {
      try {
        // Find the restaurant
        const restaurantQuery = await db.collection('restaurants')
          .where('name', '==', restaurantName)
          .where('familyId', '==', userId)
          .get();
        
        if (restaurantQuery.empty) {
          console.log(`⚠️  Restaurant not found: ${restaurantName}`);
          notFoundCount++;
          continue;
        }
        
        // Update the restaurant's cuisine
        for (const restaurantDoc of restaurantQuery.docs) {
          const currentData = restaurantDoc.data();
          await restaurantDoc.ref.update({
            cuisineId: bbqCuisineId,
            updatedAt: new Date().toISOString()
          });
          
          console.log(`✅ Updated: ${restaurantName}`);
          console.log(`   Changed from cuisineId: ${currentData.cuisineId} → ${bbqCuisineId} (BBQ)`);
          updatedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to update ${restaurantName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 BBQ cuisine update completed!`);
    console.log(`   Updated: ${updatedCount} restaurants`);
    console.log(`   Not found: ${notFoundCount} restaurants`);
    
    // Show final verification
    console.log('\n🔍 Verifying updates...');
    const verifyQuery = await db.collection('restaurants')
      .where('familyId', '==', userId)
      .where('cuisineId', '==', bbqCuisineId)
      .get();
    
    console.log(`📊 Total BBQ restaurants now: ${verifyQuery.size}`);
    verifyQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating BBQ cuisine:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
fixBBQCuisine();