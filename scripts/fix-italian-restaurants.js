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
  console.error('❌ Please provide a user ID: node scripts/fix-italian-restaurants.js YOUR_USER_ID');
  process.exit(1);
}

// Restaurant to remove (not actually in Bloomington-Normal)
const restaurantToRemove = 'Pomodoro';

// New Italian restaurants to add
const newItalianRestaurants = [
  {
    name: "Olive Garden Italian Restaurant",
    address: "1701 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-9381",
    cuisineId: "ITALIAN_ID", // Will be replaced with actual Italian cuisine ID
    priceRange: 2, // Moderate
    rating: 3.8,
    website: "https://www.olivegarden.com",
    notes: "Chain Italian restaurant offering old-fashioned Italian dinner experience. Menu favorites include ravioli di portobello, chicken parmigiana and lasagna classico.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "GLUTEN_FREE_ID", notes: "Gluten-free pasta options available" },
      { dietaryRestrictionId: "VEGETARIAN_ID", notes: "Multiple vegetarian pasta and salad options" }
    ]
  },
  {
    name: "Tobin's Pizza",
    address: "1513 N Main St, Bloomington, IL 61701",
    phone: "(309) 828-2255",
    cuisineId: "ITALIAN_ID", // Will be replaced with actual Italian cuisine ID
    priceRange: 2, // Moderate
    rating: 4.2,
    website: "https://tobinspizza.com",
    notes: "Voted #1 Pizza in McLean County. Family-friendly pizza restaurant since 1963 offering pizza delivery, take-out, and dine-in. Pizza sizes from 10\" personal to 16\" family size pan.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "VEGETARIAN_ID", notes: "Vegetarian pizza options available" },
      { dietaryRestrictionId: "GLUTEN_FREE_ID", notes: "Gluten-free crust available" }
    ]
  },
  {
    name: "La Gondola Spaghetti House",
    address: "1501 Vernon Ave, Bloomington, IL 61701",
    phone: "(309) 663-1616",
    cuisineId: "ITALIAN_ID", // Will be replaced with actual Italian cuisine ID
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Local Italian restaurant specializing in spaghetti and traditional Italian dishes. Family-owned establishment with authentic Italian flavors.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "GLUTEN_FREE_ID", notes: "Gluten-free pasta available upon request" },
      { dietaryRestrictionId: "VEGETARIAN_ID", notes: "Vegetarian pasta and pizza options" }
    ]
  },
  {
    name: "Rosati's Pizza",
    address: "Bloomington, IL",
    phone: "(309) 662-5656",
    cuisineId: "ITALIAN_ID", // Will be replaced with actual Italian cuisine ID
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Award-winning pizza restaurant - Best Pizza in Bloomington Illinois for 5 years in a row. Chicago-style deep dish and thin crust pizza with Italian specialties.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "VEGETARIAN_ID", notes: "Vegetarian pizza toppings and options" },
      { dietaryRestrictionId: "GLUTEN_FREE_ID", notes: "Gluten-free crust available" }
    ]
  },
  {
    name: "The Original Pinsaria",
    address: "Bloomington, IL",
    cuisineId: "ITALIAN_ID", // Will be replaced with actual Italian cuisine ID
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Authentic Italian restaurant featuring traditional Italian dishes and pizza with original recipes.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "VEGETARIAN_ID", notes: "Vegetarian Italian dishes available" },
      { dietaryRestrictionId: "GLUTEN_FREE_ID", notes: "Gluten-free options available" }
    ]
  }
];

async function fixItalianRestaurants() {
  try {
    console.log('🍝 Fixing Italian restaurants in Bloomington-Normal collection...');
    console.log(`👤 Using familyId: ${userId}`);
    
    // Get Italian cuisine ID
    const cuisinesSnapshot = await db.collection('cuisines').where('name', '==', 'Italian').get();
    if (cuisinesSnapshot.empty) {
      console.error('❌ Italian cuisine not found in database');
      process.exit(1);
    }
    const italianCuisineId = cuisinesSnapshot.docs[0].id;
    
    // Get dietary restriction IDs
    const [glutenFreeSnapshot, vegetarianSnapshot] = await Promise.all([
      db.collection('dietaryRestrictions').where('name', '==', 'Gluten Free').get(),
      db.collection('dietaryRestrictions').where('name', '==', 'Vegetarian').get()
    ]);
    
    const glutenFreeId = glutenFreeSnapshot.docs[0]?.id;
    const vegetarianId = vegetarianSnapshot.docs[0]?.id;
    
    console.log(`🔧 Italian cuisine ID: ${italianCuisineId}`);
    console.log(`🔧 Gluten Free ID: ${glutenFreeId}`);
    console.log(`🔧 Vegetarian ID: ${vegetarianId}`);
    
    // STEP 1: Remove Pomodoro
    console.log(`\n🗑️  Removing ${restaurantToRemove}...`);
    const removeQuery = await db.collection('restaurants')
      .where('name', '==', restaurantToRemove)
      .where('familyId', '==', userId)
      .get();
    
    let removedCount = 0;
    for (const doc of removeQuery.docs) {
      await doc.ref.delete();
      console.log(`❌ Removed: ${restaurantToRemove} (ID: ${doc.id})`);
      removedCount++;
    }
    
    // STEP 2: Add new Italian restaurants
    console.log(`\n🍕 Adding authentic Bloomington-Normal Italian restaurants...`);
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const restaurantData of newItalianRestaurants) {
      try {
        // Check if restaurant already exists
        const existingQuery = await db.collection('restaurants')
          .where('name', '==', restaurantData.name)
          .where('familyId', '==', userId)
          .get();
        
        if (!existingQuery.empty) {
          console.log(`⏭️  Skipping ${restaurantData.name} - already exists`);
          skippedCount++;
          continue;
        }
        
        // Replace placeholder IDs with actual IDs
        const restaurantDoc = {
          ...restaurantData,
          cuisineId: italianCuisineId,
          dietaryAccommodations: restaurantData.dietaryAccommodations.map(acc => ({
            ...acc,
            dietaryRestrictionId: acc.dietaryRestrictionId === 'GLUTEN_FREE_ID' ? glutenFreeId : 
                                 acc.dietaryRestrictionId === 'VEGETARIAN_ID' ? vegetarianId : 
                                 acc.dietaryRestrictionId
          })),
          familyId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('restaurants').add(restaurantDoc);
        console.log(`✅ Added: ${restaurantData.name} (ID: ${docRef.id})`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to add ${restaurantData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Italian restaurant update completed!`);
    console.log(`   Removed: ${removedCount} restaurant (${restaurantToRemove})`);
    console.log(`   Added: ${addedCount} new Italian restaurants`);
    console.log(`   Skipped: ${skippedCount} existing restaurants`);
    
    // Show final count of Italian restaurants
    const finalItalianQuery = await db.collection('restaurants')
      .where('familyId', '==', userId)
      .where('cuisineId', '==', italianCuisineId)
      .get();
    
    console.log(`\n📊 Total Italian restaurants now: ${finalItalianQuery.size}`);
    finalItalianQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.name}`);
    });
    
    // Show total restaurant count
    const totalQuery = await db.collection('restaurants')
      .where('familyId', '==', userId)
      .get();
    
    console.log(`\n📊 Total restaurants in database: ${totalQuery.size}`);
    
  } catch (error) {
    console.error('❌ Error fixing Italian restaurants:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
fixItalianRestaurants();