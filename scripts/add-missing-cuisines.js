const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse existing connection if available)
if (!admin.apps.length) {
  const serviceAccount = require('../firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`
  });
}

const db = admin.firestore();

async function addMissingCuisines() {
  try {
    console.log('Adding missing cuisines...');
    
    // Define missing cuisines to add
    const newCuisines = [
      {
        name: 'Pizza',
        description: 'Traditional and specialty pizzas'
      },
      {
        name: 'Asian',
        description: 'General Asian cuisine category'
      },
      {
        name: 'Burgers',
        description: 'Hamburgers and burger specialties'
      },
      {
        name: 'Sandwich',
        description: 'Sandwiches and subs'
      }
    ];
    
    // Check which cuisines already exist
    const cuisinesRef = db.collection('cuisines');
    const existingSnapshot = await cuisinesRef.get();
    const existingCuisines = new Set();
    
    existingSnapshot.forEach(doc => {
      existingCuisines.add(doc.data().name.toLowerCase());
    });
    
    // Add only missing cuisines
    const batch = db.batch();
    let addCount = 0;
    
    for (const cuisine of newCuisines) {
      if (!existingCuisines.has(cuisine.name.toLowerCase())) {
        const newCuisineRef = cuisinesRef.doc();
        batch.set(newCuisineRef, cuisine);
        addCount++;
        console.log(`Adding cuisine: ${cuisine.name}`);
      } else {
        console.log(`Cuisine already exists: ${cuisine.name}`);
      }
    }
    
    if (addCount > 0) {
      await batch.commit();
      console.log(`Successfully added ${addCount} new cuisines.`);
    } else {
      console.log('No new cuisines needed to be added.');
    }
    
    // Show all available cuisines
    const allCuisinesSnapshot = await cuisinesRef.get();
    const allCuisines = [];
    allCuisinesSnapshot.forEach(doc => {
      allCuisines.push(doc.data().name);
    });
    
    console.log('\nAll available cuisines:', allCuisines.sort());
    
  } catch (error) {
    console.error('Error adding cuisines:', error);
  }
}

// Function to find restaurants with similar names
async function findRestaurantsByPartialName(partialName) {
  try {
    const restaurantsRef = db.collection('restaurants');
    const snapshot = await restaurantsRef.get();
    
    const matches = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.name.toLowerCase().includes(partialName.toLowerCase())) {
        matches.push({
          id: doc.id,
          name: data.name
        });
      }
    });
    
    return matches;
  } catch (error) {
    console.error('Error finding restaurants:', error);
    return [];
  }
}

async function main() {
  await addMissingCuisines();
  
  console.log('\nSearching for pizza restaurants...');
  const pizzaRestaurants = await findRestaurantsByPartialName('pizza');
  console.log('Found pizza restaurants:');
  pizzaRestaurants.forEach(restaurant => {
    console.log(`- ${restaurant.name}`);
  });
  
  console.log('\nNow you can re-run the migration script with the correct restaurant names.');
  process.exit(0);
}

main().catch(console.error);