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
  console.error('❌ Please provide a user ID: node scripts/fix-id-mappings.js YOUR_USER_ID');
  process.exit(1);
}

// Old ID to new name mappings based on the patterns we used
const cuisineMapping = {
  '1': 'American',
  '2': 'Italian', 
  '3': 'Mexican',
  '4': 'Chinese',
  '5': 'Japanese',
  '6': 'Indian',
  '7': 'Thai',
  '8': 'Mediterranean',
  '11': 'Vietnamese',
  '12': 'Korean'
};

const dietaryRestrictionMapping = {
  '1': 'Gluten Free',
  '2': 'Vegetarian',
  '3': 'Vegan',
  '4': 'Dairy Free',
  '6': 'Shellfish Allergy',
  '8': 'Halal'
};

async function fixIdMappings() {
  try {
    console.log('🔧 Fixing ID mappings between restaurants and reference data...');
    console.log(`👤 Using familyId: ${userId}`);
    
    // Get all reference data
    const [cuisinesSnapshot, restrictionsSnapshot] = await Promise.all([
      db.collection('cuisines').get(),
      db.collection('dietaryRestrictions').get()
    ]);
    
    // Build name-to-ID maps for new Firestore IDs
    const cuisineNameToId = new Map();
    cuisinesSnapshot.forEach(doc => {
      cuisineNameToId.set(doc.data().name, doc.id);
    });
    
    const restrictionNameToId = new Map();
    restrictionsSnapshot.forEach(doc => {
      restrictionNameToId.set(doc.data().name, doc.id);
    });
    
    console.log('📊 Available cuisines:', Array.from(cuisineNameToId.keys()));
    console.log('📊 Available dietary restrictions:', Array.from(restrictionNameToId.keys()));
    
    // Get all restaurants for this user
    const restaurantsSnapshot = await db.collection('restaurants')
      .where('familyId', '==', userId)
      .get();
    
    console.log(`📊 Found ${restaurantsSnapshot.size} restaurants to update`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const restaurantDoc of restaurantsSnapshot.docs) {
      const restaurant = restaurantDoc.data();
      let needsUpdate = false;
      const updates = {};
      
      // Fix cuisine ID
      if (restaurant.cuisineId && cuisineMapping[restaurant.cuisineId]) {
        const cuisineName = cuisineMapping[restaurant.cuisineId];
        const newCuisineId = cuisineNameToId.get(cuisineName);
        if (newCuisineId) {
          updates.cuisineId = newCuisineId;
          needsUpdate = true;
          console.log(`   ${restaurant.name}: ${restaurant.cuisineId} (${cuisineName}) → ${newCuisineId}`);
        }
      }
      
      // Fix dietary accommodations
      if (restaurant.dietaryAccommodations && restaurant.dietaryAccommodations.length > 0) {
        const updatedAccommodations = restaurant.dietaryAccommodations.map(acc => {
          if (acc.dietaryRestrictionId && dietaryRestrictionMapping[acc.dietaryRestrictionId]) {
            const restrictionName = dietaryRestrictionMapping[acc.dietaryRestrictionId];
            const newRestrictionId = restrictionNameToId.get(restrictionName);
            if (newRestrictionId) {
              needsUpdate = true;
              return {
                ...acc,
                dietaryRestrictionId: newRestrictionId
              };
            }
          }
          return acc;
        });
        
        if (needsUpdate) {
          updates.dietaryAccommodations = updatedAccommodations;
        }
      }
      
      // Update the restaurant if needed
      if (needsUpdate) {
        await restaurantDoc.ref.update({
          ...updates,
          updatedAt: new Date().toISOString()
        });
        updatedCount++;
        console.log(`✅ Updated: ${restaurant.name}`);
      } else {
        skippedCount++;
        console.log(`⏭️  Skipped: ${restaurant.name} (no updates needed)`);
      }
    }
    
    console.log(`\n🎉 ID mapping fix completed!`);
    console.log(`   Updated: ${updatedCount} restaurants`);
    console.log(`   Skipped: ${skippedCount} restaurants`);
    
  } catch (error) {
    console.error('❌ Error fixing ID mappings:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
fixIdMappings();