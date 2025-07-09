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
  console.error('❌ Please provide a user ID: node scripts/add-final-7-restaurants.js YOUR_USER_ID');
  process.exit(1);
}

const finalRestaurants = [
  {
    name: "Taqueria Los Compadres",
    address: "Bloomington, IL",
    cuisineId: "3", // Mexican
    priceRange: 1, // Budget
    rating: 4.5,
    notes: "Highly-rated authentic Mexican taqueria with traditional tacos and Latin American specialties.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Corn tortillas are naturally gluten-free" },
      { dietaryRestrictionId: "2", notes: "Vegetarian taco options with beans and cheese" },
      { dietaryRestrictionId: "3", notes: "Vegan bean and vegetable tacos" }
    ]
  },
  {
    name: "Pomodoro",
    address: "Bloomington, IL",
    cuisineId: "2", // Italian
    priceRange: 2, // Moderate
    rating: 4.4,
    notes: "Popular Italian restaurant specializing in pizza, pasta, and traditional Italian dishes.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free pasta and pizza crust available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian pizza and pasta options" },
      { dietaryRestrictionId: "3", notes: "Vegan cheese available for pizzas" }
    ]
  },
  {
    name: "BonChon",
    address: "Bloomington, IL",
    cuisineId: "12", // Korean
    priceRange: 2, // Moderate
    rating: 4.4,
    notes: "Korean fried chicken specialist with authentic Korean flavors and chicken wings.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Some menu items can be prepared gluten-free" },
      { dietaryRestrictionId: "2", notes: "Vegetarian Korean sides and appetizers" }
    ]
  },
  {
    name: "The Rock Restaurant",
    address: "Normal, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Popular American restaurant known for steaks, burgers, and casual dining atmosphere.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free options available for steaks and sides" },
      { dietaryRestrictionId: "2", notes: "Vegetarian burger and salad options" }
    ]
  },
  {
    name: "Stave Wine Bar & Market",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Wine bar with diverse beer selection and small plates, perfect for wine and cheese pairings.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free wine and cheese options" },
      { dietaryRestrictionId: "2", notes: "Vegetarian cheese boards and small plates" },
      { dietaryRestrictionId: "3", notes: "Vegan cheese options available" }
    ]
  },
  {
    name: "Cadillac Jack's",
    address: "Normal, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Popular American restaurant and bar with classic American fare and casual atmosphere.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free menu options available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian American dishes and salads" }
    ]
  },
  {
    name: "Theo's Microcreamery",
    address: "Uptown Normal, IL",
    cuisineId: "1", // American
    priceRange: 1, // Budget
    rating: 4.6,
    notes: "Artisanal ice cream shop with homemade flavors including dairy-free options.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free ice cream flavors available" },
      { dietaryRestrictionId: "2", notes: "All flavors are vegetarian" },
      { dietaryRestrictionId: "3", notes: "Vegan and dairy-free ice cream options" },
      { dietaryRestrictionId: "4", notes: "Dairy-free specialty flavors available" }
    ]
  }
];

async function addFinal7Restaurants() {
  try {
    console.log('🎯 Adding the final 7 restaurants to reach exactly 60...');
    console.log(`👤 Using familyId: ${userId}`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const restaurantData of finalRestaurants) {
      try {
        // Check if restaurant already exists for this user
        const existingQuery = await db.collection('restaurants')
          .where('name', '==', restaurantData.name)
          .where('familyId', '==', userId)
          .get();
        
        if (!existingQuery.empty) {
          console.log(`⏭️  Skipping ${restaurantData.name} - already exists for this user`);
          skippedCount++;
          continue;
        }
        
        // Add the restaurant with user's familyId
        const restaurantDoc = {
          ...restaurantData,
          familyId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('restaurants').add(restaurantDoc);
        console.log(`✅ Added: ${restaurantData.name} (${restaurantData.priceRange === 1 ? '$' : restaurantData.priceRange === 2 ? '$$' : '$$$'})`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to add ${restaurantData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Final batch completed! Added ${addedCount} restaurants, skipped ${skippedCount} existing restaurants.`);
    
    // Show final count
    const allRestaurants = await db.collection('restaurants')
      .where('familyId', '==', userId)
      .get();
    
    console.log(`\n🏆 FINAL TOTAL: ${allRestaurants.size} restaurants in the Bloomington-Normal collection!`);
    
    if (allRestaurants.size === 60) {
      console.log('🎯 Perfect! Exactly 60 restaurants achieved.');
    } else if (allRestaurants.size > 60) {
      console.log(`⚠️  We have ${allRestaurants.size - 60} more than target (${allRestaurants.size}/60)`);
    } else {
      console.log(`⚠️  We need ${60 - allRestaurants.size} more restaurants (${allRestaurants.size}/60)`);
    }
    
  } catch (error) {
    console.error('❌ Error adding final restaurants:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
addFinal7Restaurants();