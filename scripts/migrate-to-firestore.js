const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'family-restaurant-picker'
});

const db = admin.firestore();

const dietaryRestrictions = [
  { name: 'Gluten Free', description: 'Cannot consume gluten-containing foods' },
  { name: 'Vegetarian', description: 'Does not eat meat' },
  { name: 'Vegan', description: 'Does not eat any animal products' },
  { name: 'Dairy Free', description: 'Cannot consume dairy products' },
  { name: 'Nut Allergy', description: 'Allergic to nuts' },
  { name: 'Shellfish Allergy', description: 'Allergic to shellfish' },
  { name: 'Kosher', description: 'Follows kosher dietary laws' },
  { name: 'Halal', description: 'Follows halal dietary laws' },
  { name: 'Low Sodium', description: 'Requires low sodium options' },
  { name: 'Diabetic Friendly', description: 'Requires low sugar/carb options' },
];

const cuisines = [
  { name: 'American', description: 'Traditional American cuisine' },
  { name: 'Italian', description: 'Italian cuisine including pizza and pasta' },
  { name: 'Mexican', description: 'Mexican and Tex-Mex cuisine' },
  { name: 'Chinese', description: 'Chinese cuisine' },
  { name: 'Japanese', description: 'Japanese cuisine including sushi' },
  { name: 'Indian', description: 'Indian cuisine' },
  { name: 'Thai', description: 'Thai cuisine' },
  { name: 'Mediterranean', description: 'Mediterranean cuisine' },
  { name: 'French', description: 'French cuisine' },
  { name: 'Greek', description: 'Greek cuisine' },
  { name: 'Vietnamese', description: 'Vietnamese cuisine' },
  { name: 'Korean', description: 'Korean cuisine' },
  { name: 'BBQ', description: 'Barbecue and grilled foods' },
  { name: 'Seafood', description: 'Seafood-focused restaurants' },
  { name: 'Steakhouse', description: 'Steak and grilled meat focused' },
];

const sampleRestaurants = [
  {
    name: 'Pizza Palace',
    address: '123 Main St',
    phone: '555-0123',
    cuisine: 'Italian',
    priceRange: 2,
    rating: 4.5,
    website: 'https://pizzapalace.com',
    notes: 'Great gluten-free options',
    dietaryAccommodations: ['Gluten Free'],
    familyId: 'demo' // This will be replaced with actual user IDs
  },
  {
    name: 'Veggie Delight',
    address: '456 Oak Ave',
    phone: '555-0456',
    cuisine: 'Mexican',
    priceRange: 2,
    rating: 4.0,
    website: 'https://veggiedelight.com',
    notes: 'All vegetarian menu',
    dietaryAccommodations: ['Vegetarian', 'Vegan'],
    familyId: 'demo'
  },
  {
    name: 'Spice Garden',
    address: '789 Elm St',
    phone: '555-0789',
    cuisine: 'Indian',
    priceRange: 3,
    rating: 4.3,
    website: 'https://spicegarden.com',
    notes: 'Authentic Indian cuisine with many vegan options',
    dietaryAccommodations: ['Vegetarian', 'Vegan', 'Gluten Free'],
    familyId: 'demo'
  },
  {
    name: 'Ocean Breeze',
    address: '321 Harbor Blvd',
    phone: '555-0321',
    cuisine: 'Seafood',
    priceRange: 4,
    rating: 4.7,
    website: 'https://oceanbreeze.com',
    notes: 'Fresh seafood daily, some gluten-free options',
    dietaryAccommodations: ['Gluten Free'],
    familyId: 'demo'
  },
  {
    name: 'Green Leaf Cafe',
    address: '654 Park Ave',
    phone: '555-0654',
    cuisine: 'American',
    priceRange: 2,
    rating: 4.2,
    website: 'https://greenleafcafe.com',
    notes: 'Farm-to-table restaurant with many dietary options',
    dietaryAccommodations: ['Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free'],
    familyId: 'demo'
  }
];

async function migrateDietaryRestrictions() {
  console.log('Migrating dietary restrictions...');
  const batch = db.batch();
  
  for (const restriction of dietaryRestrictions) {
    const docRef = db.collection('dietaryRestrictions').doc();
    batch.set(docRef, {
      ...restriction,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  await batch.commit();
  console.log(`Migrated ${dietaryRestrictions.length} dietary restrictions`);
}

async function migrateCuisines() {
  console.log('Migrating cuisines...');
  const batch = db.batch();
  
  for (const cuisine of cuisines) {
    const docRef = db.collection('cuisines').doc();
    batch.set(docRef, {
      ...cuisine,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  await batch.commit();
  console.log(`Migrated ${cuisines.length} cuisines`);
}

async function migrateSampleRestaurants() {
  console.log('Migrating sample restaurants...');
  
  // Get cuisine and dietary restriction IDs
  const cuisinesSnapshot = await db.collection('cuisines').get();
  const cuisineMap = {};
  cuisinesSnapshot.forEach(doc => {
    cuisineMap[doc.data().name] = doc.id;
  });
  
  const restrictionsSnapshot = await db.collection('dietaryRestrictions').get();
  const restrictionMap = {};
  restrictionsSnapshot.forEach(doc => {
    restrictionMap[doc.data().name] = doc.id;
  });
  
  const batch = db.batch();
  
  for (const restaurant of sampleRestaurants) {
    const docRef = db.collection('restaurants').doc();
    const restaurantData = {
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      cuisineId: cuisineMap[restaurant.cuisine],
      priceRange: restaurant.priceRange,
      rating: restaurant.rating,
      website: restaurant.website,
      notes: restaurant.notes,
      dietaryAccommodations: restaurant.dietaryAccommodations.map(name => restrictionMap[name]).filter(Boolean),
      familyId: restaurant.familyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    batch.set(docRef, restaurantData);
  }
  
  await batch.commit();
  console.log(`Migrated ${sampleRestaurants.length} sample restaurants`);
}

async function checkExistingData() {
  const cuisinesSnapshot = await db.collection('cuisines').limit(1).get();
  const restrictionsSnapshot = await db.collection('dietaryRestrictions').limit(1).get();
  const restaurantsSnapshot = await db.collection('restaurants').limit(1).get();
  
  return {
    hasCuisines: !cuisinesSnapshot.empty,
    hasRestrictions: !restrictionsSnapshot.empty,
    hasRestaurants: !restaurantsSnapshot.empty
  };
}

async function migrateAll() {
  try {
    console.log('Starting Firestore migration...');
    
    const existing = await checkExistingData();
    
    if (!existing.hasRestrictions) {
      await migrateDietaryRestrictions();
    } else {
      console.log('Dietary restrictions already exist, skipping...');
    }
    
    if (!existing.hasCuisines) {
      await migrateCuisines();
    } else {
      console.log('Cuisines already exist, skipping...');
    }
    
    if (!existing.hasRestaurants) {
      await migrateSampleRestaurants();
    } else {
      console.log('Restaurants already exist, skipping...');
    }
    
    console.log('Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Sign up/login to your app to create a user account');
    console.log('2. Create family members with dietary restrictions');
    console.log('3. Add your own restaurants or use the sample data');
    console.log('4. Get recommendations based on your family preferences');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrateAll();