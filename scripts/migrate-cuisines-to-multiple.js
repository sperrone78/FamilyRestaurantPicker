const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`
});

const db = admin.firestore();

async function migrateCuisinesToMultiple() {
  try {
    console.log('Starting migration of restaurant cuisines to multiple format...');
    
    // Get all restaurants
    const restaurantsRef = db.collection('restaurants');
    const snapshot = await restaurantsRef.get();
    
    if (snapshot.empty) {
      console.log('No restaurants found to migrate.');
      return;
    }
    
    const batch = db.batch();
    let updateCount = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      let needsUpdate = false;
      const updates = {};
      
      // Check if restaurant has old cuisineId format
      if (data.cuisineId && !data.cuisineIds) {
        console.log(`Migrating restaurant: ${data.name}`);
        
        // Convert single cuisineId to array of cuisineIds
        updates.cuisineIds = [data.cuisineId];
        needsUpdate = true;
        
        // Keep the old cuisineId for backward compatibility (for now)
        // You can remove this line later once fully migrated
        // updates.cuisineId = admin.firestore.FieldValue.delete();
      }
      
      if (needsUpdate) {
        batch.update(doc.ref, updates);
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully migrated ${updateCount} restaurants to multiple cuisine format.`);
    } else {
      console.log('No restaurants needed migration.');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Helper function to add additional cuisines to specific restaurants
async function addAdditionalCuisines() {
  try {
    console.log('\nAdding additional cuisine tags to restaurants...');
    
    // Get all cuisines for reference
    const cuisinesRef = db.collection('cuisines');
    const cuisinesSnapshot = await cuisinesRef.get();
    const cuisineMap = {};
    
    cuisinesSnapshot.forEach(doc => {
      const data = doc.data();
      cuisineMap[data.name.toLowerCase()] = doc.id;
    });
    
    console.log('Available cuisines:', Object.keys(cuisineMap));
    
    // Example: Add "Pizza" tag to Italian restaurants
    const restaurantsRef = db.collection('restaurants');
    const italianRestaurants = await restaurantsRef.get();
    
    const batch = db.batch();
    let updateCount = 0;
    
    // This is just an example - you'll need to manually specify which restaurants get which additional tags
    const restaurantUpdates = [
      // Pizza restaurants - add Pizza + Italian tags
      {
        name: "Tobin's Pizza",
        additionalCuisines: ['Pizza', 'Italian']
      },
      {
        name: "Firehouse Pizza",
        additionalCuisines: ['Pizza', 'Italian']
      },
      {
        name: "Monical's Pizza",
        additionalCuisines: ['Pizza', 'Italian']
      },
      {
        name: "Rosati's Pizza",
        additionalCuisines: ['Pizza', 'Italian']
      },
      // Steakhouses - add Steakhouse + American tags
      {
        name: "Alexander's Steakhouse",
        additionalCuisines: ['Steakhouse', 'American']
      },
      {
        name: "Baxter's American Grille",
        additionalCuisines: ['Steakhouse', 'American']
      },
      // Italian restaurants that might also serve pizza
      {
        name: "Lucca Grill",
        additionalCuisines: ['Pizza', 'Italian']
      },
      // Thai restaurants - add Asian tag
      {
        name: "Thai House",
        additionalCuisines: ['Asian', 'Thai']
      },
    ];
    
    for (const update of restaurantUpdates) {
      const restaurantQuery = await restaurantsRef.where('name', '==', update.name).get();
      
      if (!restaurantQuery.empty) {
        const restaurantDoc = restaurantQuery.docs[0];
        const currentData = restaurantDoc.data();
        
        // Convert cuisine names to IDs
        const cuisineIds = [];
        for (const cuisineName of update.additionalCuisines) {
          const cuisineId = cuisineMap[cuisineName.toLowerCase()];
          if (cuisineId) {
            cuisineIds.push(cuisineId);
          } else {
            console.warn(`Cuisine "${cuisineName}" not found in cuisines collection`);
          }
        }
        
        if (cuisineIds.length > 0) {
          // Merge with existing cuisineIds, removing duplicates
          const existingIds = currentData.cuisineIds || [];
          const mergedIds = [...new Set([...existingIds, ...cuisineIds])];
          
          batch.update(restaurantDoc.ref, {
            cuisineIds: mergedIds
          });
          
          updateCount++;
          console.log(`Updated ${update.name} with cuisines: ${update.additionalCuisines.join(', ')}`);
        }
      } else {
        console.warn(`Restaurant "${update.name}" not found`);
      }
    }
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully added additional cuisines to ${updateCount} restaurants.`);
    } else {
      console.log('No additional cuisines were added.');
    }
    
  } catch (error) {
    console.error('Error adding additional cuisines:', error);
  }
}

// Run the migration
async function main() {
  await migrateCuisinesToMultiple();
  await addAdditionalCuisines();
  
  console.log('\nMigration process completed. You can now:');
  console.log('1. Test the application to ensure multiple cuisines are displayed correctly');
  console.log('2. Manually add additional cuisine tags to specific restaurants in Firebase Console');
  console.log('3. Update the restaurantUpdates array in this script to bulk-add specific cuisine combinations');
  console.log('4. After testing, you can remove the old cuisineId field from restaurants');
  
  process.exit(0);
}

main().catch(console.error);