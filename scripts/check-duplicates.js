const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://place-picker-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function checkDuplicates() {
  console.log('Checking for duplicate restaurants in Firestore...');
  
  try {
    // Get all restaurants
    const restaurantsSnapshot = await db.collection('restaurants').get();
    console.log(`Found ${restaurantsSnapshot.size} restaurants in Firestore`);
    
    // Track restaurants by name+address
    const restaurantMap = new Map();
    const allRestaurants = [];
    
    restaurantsSnapshot.forEach((doc) => {
      const data = doc.data();
      const restaurant = {
        id: doc.id,
        ...data
      };
      
      allRestaurants.push(restaurant);
      
      // Create a unique key for deduplication
      const key = `${data.name.toLowerCase()}-${(data.address || '').toLowerCase()}`;
      
      if (!restaurantMap.has(key)) {
        restaurantMap.set(key, []);
      }
      restaurantMap.get(key).push(restaurant);
    });
    
    // Find duplicates
    const duplicates = [];
    restaurantMap.forEach((restaurants, key) => {
      if (restaurants.length > 1) {
        duplicates.push({
          key,
          restaurants: restaurants.map(r => ({
            id: r.id,
            name: r.name,
            address: r.address || 'No address',
            familyId: r.familyId || 'No familyId'
          }))
        });
      }
    });
    
    if (duplicates.length > 0) {
      console.log(`\nFound ${duplicates.length} duplicate groups:`);
      duplicates.forEach((group, index) => {
        console.log(`\n${index + 1}. ${group.key}`);
        group.restaurants.forEach(r => {
          console.log(`   - ID: ${r.id}, Name: ${r.name}, Address: ${r.address}, FamilyId: ${r.familyId}`);
        });
      });
    } else {
      console.log('\nNo duplicates found in Firestore');
    }
    
    // Check for documents with familyId still present
    const withFamilyId = allRestaurants.filter(r => r.familyId);
    if (withFamilyId.length > 0) {
      console.log(`\nFound ${withFamilyId.length} restaurants still with familyId:`);
      withFamilyId.forEach(r => {
        console.log(`  - ID: ${r.id}, Name: ${r.name}, FamilyId: ${r.familyId}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking duplicates:', error);
  }
}

checkDuplicates()
  .then(() => {
    console.log('\nDuplicate check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });