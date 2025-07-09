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
  console.error('❌ Please provide a user ID: node scripts/add-bbq-chinese-restaurants.js YOUR_USER_ID');
  process.exit(1);
}

const newRestaurants = [
  // BBQ Restaurants
  {
    name: "Brass Pig Smoke & Alehouse",
    address: "Corner of Main and Mulberry Street, Bloomington, IL 61701",
    phone: "(309) 828-2555",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Full service restaurant in Downtown Bloomington featuring a unique twist on traditional BBQ. Uses aged White Oak for slow smoked brisket with custom built in-house smoker taking 12-16 hours.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Can prepare gluten-free smoked meats without sauce" },
      { dietaryRestrictionId: "2", notes: "Vegetarian sides and salads available" }
    ]
  },
  {
    name: "Uncle Tony's Food for the Soul",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Local BBQ spot known for soul food and barbecue specialties with authentic flavors.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "2", notes: "Vegetarian soul food sides available" }
    ]
  },
  {
    name: "Logan's Roadhouse",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 3.9,
    notes: "Chain steakhouse known for grilled steaks and BBQ with roadhouse atmosphere and mesquite-grilled specialties.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-sensitive menu available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian options and salads" }
    ]
  },

  // Chinese Restaurants
  {
    name: "Sichuan Chinese Restaurant",
    address: "122 E Beaufort St, Normal, IL 61761",
    phone: "(309) 452-8888",
    cuisineId: "4", // Chinese
    priceRange: 2, // Moderate
    rating: 4.5,
    notes: "Standout destination for authentic Sichuan cuisine with vibrant flavors. Consistently rated as the best and freshest Chinese food in town. Specializes in Dry Pot, Soybean Paste Sauce Braised Chicken, and fresh seafood.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Rice dishes and steamed preparations without soy sauce" },
      { dietaryRestrictionId: "2", notes: "Traditional vegetable and tofu Sichuan dishes" },
      { dietaryRestrictionId: "3", notes: "Vegan vegetable stir-fries and tofu preparations" }
    ]
  },
  {
    name: "Jing's Hot Wok Chinese Restaurant",
    address: "Bloomington, IL",
    phone: "(309) 662-8888",
    cuisineId: "4", // Chinese
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Award-winning Chinese restaurant offering authentic Chinese cuisine. Known for variety of tastes and high quality fresh ingredients. Offers catering for up to 500 people.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Steamed rice dishes and stir-fries without wheat-based sauces" },
      { dietaryRestrictionId: "2", notes: "Vegetable stir-fries and tofu dishes" },
      { dietaryRestrictionId: "3", notes: "Vegan tofu and vegetable preparations" }
    ]
  },
  {
    name: "China Star",
    address: "Bloomington, IL",
    phone: "(309) 828-3888",
    cuisineId: "4", // Chinese
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Authentic Chinese restaurant known for variety of tastes and high quality fresh ingredients. Offers traditional Chinese dishes with both authentic and Americanized options.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Rice-based dishes and steamed preparations" },
      { dietaryRestrictionId: "2", notes: "Vegetarian Chinese dishes and tofu options" },
      { dietaryRestrictionId: "3", notes: "Vegan stir-fries and vegetable dishes" }
    ]
  },
  {
    name: "Hot Wok Express",
    address: "Bloomington, IL",
    phone: "(309) 664-8888",
    cuisineId: "4", // Chinese
    priceRange: 1, // Budget
    rating: 4.0,
    notes: "Fast-casual Chinese restaurant known for varieties of taste and fresh ingredients. Offers authentic and delicious Chinese cuisine at affordable prices.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Steamed rice and simple stir-fries" },
      { dietaryRestrictionId: "2", notes: "Vegetable dishes and tofu options" }
    ]
  },
  {
    name: "Chi Family Express",
    address: "Bloomington, IL",
    cuisineId: "4", // Chinese
    priceRange: 1, // Budget
    rating: 4.2,
    notes: "Family-owned Chinese restaurant promoting themselves as Bloomington-Normal's freshest Chinese food. Known for authentic flavors and fresh ingredients.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Rice dishes and steamed vegetables" },
      { dietaryRestrictionId: "2", notes: "Traditional vegetable and tofu Chinese dishes" },
      { dietaryRestrictionId: "3", notes: "Vegan vegetable preparations" }
    ]
  },
  {
    name: "Yumz Asian Cuisine",
    address: "Bloomington, IL",
    phone: "(309) 662-7799",
    cuisineId: "4", // Chinese
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Family owned restaurant with master chef who picks only the freshest ingredients. Authentic Asian cuisine with Chinese specialties and fusion options.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Rice noodles and steamed dishes without wheat sauces" },
      { dietaryRestrictionId: "2", notes: "Extensive vegetarian Asian dishes" },
      { dietaryRestrictionId: "3", notes: "Vegan Asian preparations with tofu and vegetables" }
    ]
  }
];

async function addBBQChineseRestaurants() {
  try {
    console.log('🍖🥢 Adding missing BBQ and Chinese restaurants to Bloomington-Normal collection...');
    console.log(`👤 Using familyId: ${userId}`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const restaurantData of newRestaurants) {
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
    
    console.log(`\n🎉 BBQ & Chinese expansion completed! Added ${addedCount} restaurants, skipped ${skippedCount} existing restaurants.`);
    
    // Show updated count
    const allRestaurants = await db.collection('restaurants')
      .where('familyId', '==', userId)
      .get();
    
    console.log(`📊 Total restaurants in database: ${allRestaurants.size}`);
    
    // Summary by type added
    const addedBBQ = newRestaurants.filter(r => 
      r.notes.toLowerCase().includes('bbq') || 
      r.notes.toLowerCase().includes('barbecue') || 
      r.notes.toLowerCase().includes('smoked')
    ).length;
    const addedChinese = newRestaurants.filter(r => r.cuisineId === "4").length;
    
    console.log('\n📊 Added restaurants summary:');
    console.log(`   BBQ/Barbecue: ${addedBBQ} restaurants`);
    console.log(`   Chinese: ${addedChinese} restaurants`);
    
    // Show BBQ restaurants
    console.log('\n🍖 BBQ Restaurants added:');
    newRestaurants.filter(r => 
      r.notes.toLowerCase().includes('bbq') || 
      r.notes.toLowerCase().includes('barbecue') || 
      r.notes.toLowerCase().includes('smoked')
    ).forEach(r => console.log(`   - ${r.name}`));
    
    // Show Chinese restaurants
    console.log('\n🥢 Chinese Restaurants added:');
    newRestaurants.filter(r => r.cuisineId === "4").forEach(r => 
      console.log(`   - ${r.name}`)
    );
    
  } catch (error) {
    console.error('❌ Error adding BBQ and Chinese restaurants:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
addBBQChineseRestaurants();