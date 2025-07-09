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
  console.error('❌ Please provide a user ID: node scripts/add-specialty-cuisines.js YOUR_USER_ID');
  process.exit(1);
}

const newCuisines = [
  {
    name: "Dessert & Ice Cream",
    description: "Ice cream shops, dessert parlors, and specialty sweet treats"
  },
  {
    name: "Bakery & Pastries", 
    description: "Bakeries, pastry shops, and fresh baked goods"
  },
  {
    name: "Cafe & Coffee",
    description: "Coffee shops, cafes, and light breakfast/lunch spots"
  }
];

async function addSpecialtyCuisines() {
  try {
    console.log('🍰 Adding specialty cuisine categories...');
    console.log(`👤 Using familyId: ${userId}`);
    
    let addedCount = 0;
    let skippedCount = 0;
    const addedCuisineIds = {};
    
    for (const cuisineData of newCuisines) {
      try {
        // Check if cuisine already exists
        const existingQuery = await db.collection('cuisines')
          .where('name', '==', cuisineData.name)
          .get();
        
        if (!existingQuery.empty) {
          console.log(`⏭️  Skipping ${cuisineData.name} - already exists`);
          addedCuisineIds[cuisineData.name] = existingQuery.docs[0].id;
          skippedCount++;
          continue;
        }
        
        // Add the new cuisine
        const cuisineDoc = {
          ...cuisineData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('cuisines').add(cuisineDoc);
        addedCuisineIds[cuisineData.name] = docRef.id;
        console.log(`✅ Added cuisine: ${cuisineData.name} (ID: ${docRef.id})`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to add ${cuisineData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Specialty cuisines completed! Added ${addedCount} cuisines, skipped ${skippedCount} existing cuisines.`);
    
    // Now update the specific restaurants for this family
    console.log('\n🏪 Updating restaurant categorizations for your family...');
    
    const restaurantUpdates = [
      {
        name: "Theo's Microcreamery",
        newCuisineId: addedCuisineIds["Dessert & Ice Cream"],
        newCuisineName: "Dessert & Ice Cream"
      },
      {
        name: "Ivy Lane Bakery",
        newCuisineId: addedCuisineIds["Bakery & Pastries"], 
        newCuisineName: "Bakery & Pastries"
      }
    ];
    
    let updatedRestaurants = 0;
    
    for (const update of restaurantUpdates) {
      try {
        // Find restaurant by name and familyId (restaurants are family-specific)
        const restaurantQuery = await db.collection('restaurants')
          .where('name', '==', update.name)
          .where('familyId', '==', userId)
          .get();
        
        if (restaurantQuery.empty) {
          console.log(`⚠️  Restaurant ${update.name} not found for family ${userId}`);
          continue;
        }
        
        // Update the restaurant's cuisine
        const restaurantDoc = restaurantQuery.docs[0];
        await restaurantDoc.ref.update({
          cuisineId: update.newCuisineId,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ Updated ${update.name} → ${update.newCuisineName}`);
        updatedRestaurants++;
        
      } catch (error) {
        console.error(`❌ Failed to update ${update.name}:`, error.message);
      }
    }
    
    console.log(`\n📊 Restaurant updates completed! Updated ${updatedRestaurants} restaurants.`);
    
    // Show final summary
    console.log('\n📋 Summary of changes:');
    console.log('   New Cuisine Categories:');
    newCuisines.forEach(cuisine => {
      const id = addedCuisineIds[cuisine.name];
      console.log(`   - ${cuisine.name} (${id ? 'ID: ' + id : 'Failed'})`);
    });
    
    console.log('\n   Restaurant Recategorizations:');
    restaurantUpdates.forEach(update => {
      console.log(`   - ${update.name} → ${update.newCuisineName}`);
    });
    
    console.log('\n🎯 All families can now filter by:');
    console.log('   - "Dessert & Ice Cream" to find ice cream shops');
    console.log('   - "Bakery & Pastries" to find bakeries');
    console.log('   - "Cafe & Coffee" for future coffee shops');
    console.log('\n📝 Note: Cuisine categories are global and shared across all families.');
    console.log('   Restaurant updates only apply to your family\'s restaurant list.');
    
  } catch (error) {
    console.error('❌ Error adding specialty cuisines:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
addSpecialtyCuisines();