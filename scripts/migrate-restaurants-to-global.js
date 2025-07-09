const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://place-picker-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function migrateRestaurantsToGlobal() {
  console.log('Starting restaurant migration to global collection...');
  
  try {
    // Get all existing restaurants
    const restaurantsSnapshot = await db.collection('restaurants').get();
    console.log(`Found ${restaurantsSnapshot.size} restaurants to migrate`);
    
    // Track restaurants by name+address to detect duplicates
    const restaurantMap = new Map();
    const batch = db.batch();
    let processedCount = 0;
    
    // Process each restaurant
    restaurantsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Create a unique key for deduplication
      const key = `${data.name.toLowerCase()}-${(data.address || '').toLowerCase()}`;
      
      if (!restaurantMap.has(key)) {
        // This is a new restaurant, add to global collection
        const newRestaurantData = {
          name: data.name,
          address: data.address || null,
          phone: data.phone || null,
          cuisineId: data.cuisineId || null,
          priceRange: data.priceRange || null,
          rating: data.rating || null,
          website: data.website || null,
          notes: data.notes || null,
          dietaryAccommodations: data.dietaryAccommodations || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
        
        // Create new document with original ID if possible
        const newDocRef = db.collection('restaurants').doc();
        batch.set(newDocRef, newRestaurantData);
        
        restaurantMap.set(key, {
          newId: newDocRef.id,
          originalId: doc.id,
          originalData: data
        });
        
        console.log(`Added unique restaurant: ${data.name}`);
        processedCount++;
      } else {
        console.log(`Skipped duplicate restaurant: ${data.name}`);
      }
    });
    
    // Commit the batch
    await batch.commit();
    console.log(`Successfully migrated ${processedCount} unique restaurants`);
    
    // Now update favorites and comments to reference new restaurant IDs
    await updateFavoritesAndComments(restaurantMap);
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

async function updateFavoritesAndComments(restaurantMap) {
  console.log('Updating favorites and comments...');
  
  // Create mapping from old ID to new ID
  const idMapping = new Map();
  restaurantMap.forEach((value, key) => {
    idMapping.set(value.originalId, value.newId);
  });
  
  // Update favorites
  const favoritesSnapshot = await db.collection('restaurantFavorites').get();
  const favoritesBatch = db.batch();
  
  favoritesSnapshot.forEach((doc) => {
    const data = doc.data();
    const newRestaurantId = idMapping.get(data.restaurantId);
    
    if (newRestaurantId) {
      // Update with new restaurant ID and remove familyId
      const updatedData = {
        userId: data.userId,
        restaurantId: newRestaurantId,
        createdAt: data.createdAt
      };
      favoritesBatch.update(doc.ref, updatedData);
    } else {
      // Remove favorite if restaurant not found
      favoritesBatch.delete(doc.ref);
    }
  });
  
  await favoritesBatch.commit();
  console.log(`Updated ${favoritesSnapshot.size} favorites`);
  
  // Update comments
  const commentsSnapshot = await db.collection('restaurantComments').get();
  const commentsBatch = db.batch();
  
  commentsSnapshot.forEach((doc) => {
    const data = doc.data();
    const newRestaurantId = idMapping.get(data.restaurantId);
    
    if (newRestaurantId) {
      // Update with new restaurant ID and remove familyId
      const updatedData = {
        userId: data.userId,
        restaurantId: newRestaurantId,
        content: data.content,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
      commentsBatch.update(doc.ref, updatedData);
    } else {
      // Remove comment if restaurant not found
      commentsBatch.delete(doc.ref);
    }
  });
  
  await commentsBatch.commit();
  console.log(`Updated ${commentsSnapshot.size} comments`);
}

async function cleanupOldRestaurants() {
  console.log('Cleaning up old family-specific restaurants...');
  
  // This is optional - you may want to keep old data for backup
  // Uncomment the following lines if you want to delete old restaurants
  
  /*
  const oldRestaurantsSnapshot = await db.collection('restaurants').where('familyId', '!=', '').get();
  const deleteBatch = db.batch();
  
  oldRestaurantsSnapshot.forEach((doc) => {
    deleteBatch.delete(doc.ref);
  });
  
  await deleteBatch.commit();
  console.log(`Deleted ${oldRestaurantsSnapshot.size} old family-specific restaurants`);
  */
  
  console.log('Cleanup completed (old restaurants preserved for backup)');
}

// Run the migration
migrateRestaurantsToGlobal()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });