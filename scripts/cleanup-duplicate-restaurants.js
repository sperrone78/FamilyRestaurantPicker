const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://place-picker-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function cleanupDuplicateRestaurants() {
  console.log('Starting cleanup of duplicate restaurants...');
  
  try {
    // Get all restaurants
    const restaurantsSnapshot = await db.collection('restaurants').get();
    console.log(`Found ${restaurantsSnapshot.size} restaurants in Firestore`);
    
    // Track restaurants by name+address
    const restaurantMap = new Map();
    
    restaurantsSnapshot.forEach((doc) => {
      const data = doc.data();
      const restaurant = {
        id: doc.id,
        ref: doc.ref,
        ...data
      };
      
      // Create a unique key for deduplication
      const key = `${data.name.toLowerCase()}-${(data.address || '').toLowerCase()}`;
      
      if (!restaurantMap.has(key)) {
        restaurantMap.set(key, []);
      }
      restaurantMap.get(key).push(restaurant);
    });
    
    // Find and clean up duplicates
    const batch = db.batch();
    let deletedCount = 0;
    
    restaurantMap.forEach((restaurants, key) => {
      if (restaurants.length > 1) {
        // Sort by whether they have familyId - we want to keep the ones WITHOUT familyId (global)
        restaurants.sort((a, b) => {
          // Put restaurants without familyId first
          if (!a.familyId && b.familyId) return -1;
          if (a.familyId && !b.familyId) return 1;
          return 0;
        });
        
        // Keep the first one (without familyId) and delete the rest
        const toKeep = restaurants[0];
        const toDelete = restaurants.slice(1);
        
        console.log(`\nProcessing duplicates for: ${key}`);
        console.log(`  Keeping: ${toKeep.id} (familyId: ${toKeep.familyId || 'none'})`);
        
        toDelete.forEach(restaurant => {
          console.log(`  Deleting: ${restaurant.id} (familyId: ${restaurant.familyId || 'none'})`);
          batch.delete(restaurant.ref);
          deletedCount++;
        });
      }
    });
    
    if (deletedCount > 0) {
      console.log(`\nDeleting ${deletedCount} duplicate restaurants...`);
      await batch.commit();
      console.log(`Successfully deleted ${deletedCount} duplicate restaurants`);
    } else {
      console.log('No duplicates found to delete');
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

cleanupDuplicateRestaurants()
  .then(() => {
    console.log('✅ Duplicate cleanup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });