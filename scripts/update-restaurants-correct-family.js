#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'family-restaurant-picker'
});

const db = admin.firestore();

const familyId = "1EN6UZCeeHOW0i8lR5y7yh6fnF42";

async function updateRestaurantsCorrectFamily() {
  try {
    console.log('🔍 Updating restaurants for the correct family ID...');
    console.log(`👤 Using familyId: ${familyId}`);
    
    const restaurantUpdates = [
      {
        name: "Theo's Microcreamery",
        newCuisineId: "0Z6li14BvbMVjvdWeOfQ", // Dessert & Ice Cream
        newCuisineName: "Dessert & Ice Cream"
      },
      {
        name: "Ivy Lane Bakery", 
        newCuisineId: "EddcONUzIhZWZooJpJM5", // Bakery & Pastries
        newCuisineName: "Bakery & Pastries"
      }
    ];
    
    let updatedCount = 0;
    
    for (const update of restaurantUpdates) {
      try {
        // Find restaurant by name and correct family ID
        const restaurantQuery = await db.collection('restaurants')
          .where('name', '==', update.name)
          .where('familyId', '==', familyId)
          .get();
        
        if (restaurantQuery.empty) {
          console.log(`⚠️  ${update.name} not found for family ${familyId}`);
          
          // Try fuzzy search
          const allRestaurantsQuery = await db.collection('restaurants')
            .where('familyId', '==', familyId)
            .get();
          
          let found = false;
          allRestaurantsQuery.forEach(doc => {
            const data = doc.data();
            if (data.name && data.name.toLowerCase().includes(update.name.toLowerCase().split(' ')[0])) {
              console.log(`   🔍 Found similar: "${data.name}" (ID: ${doc.id})`);
              found = true;
            }
          });
          
          if (!found) {
            console.log(`   🔍 No similar restaurants found`);
          }
          continue;
        }
        
        // Update the restaurant's cuisine
        const restaurantDoc = restaurantQuery.docs[0];
        const currentData = restaurantDoc.data();
        
        console.log(`📝 Updating: ${update.name}`);
        console.log(`   Current cuisine: ${currentData.cuisineId}`);
        console.log(`   New cuisine: ${update.newCuisineId} (${update.newCuisineName})`);
        
        await restaurantDoc.ref.update({
          cuisineId: update.newCuisineId,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ Successfully updated ${update.name} → ${update.newCuisineName}`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to update ${update.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Update completed! Successfully updated ${updatedCount} restaurants.`);
    
    if (updatedCount > 0) {
      console.log('\n🎯 Users can now filter by:');
      console.log('   - "Dessert & Ice Cream" to find ice cream shops like Theo\'s');
      console.log('   - "Bakery & Pastries" to find bakeries like Ivy Lane');
      console.log('\n✨ The restaurants will now appear in the correct cuisine filters!');
    }
    
  } catch (error) {
    console.error('❌ Error updating restaurants:', error.message);
  } finally {
    process.exit(0);
  }
}

updateRestaurantsCorrectFamily();