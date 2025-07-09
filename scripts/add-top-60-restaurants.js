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
  console.error('❌ Please provide a user ID: node scripts/add-top-60-restaurants.js YOUR_USER_ID');
  process.exit(1);
}

const additionalRestaurants = [
  // Steakhouses & Fine Dining
  {
    name: "Alexander's Steakhouse",
    address: "1503 East College Avenue, Normal, IL 61761",
    phone: "(309) 454-7300",
    cuisineId: "1", // American
    priceRange: 3, // Upscale
    rating: 4.4,
    notes: "Upscale steakhouse specializing in premium cuts of beef and fine dining experience.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free preparation available for steaks and sides" },
      { dietaryRestrictionId: "2", notes: "Vegetarian sides and salads available" }
    ]
  },
  {
    name: "Baxter's American Grille",
    address: "3212 East Empire Street, Bloomington, IL 61704",
    phone: "(309) 662-1114",
    cuisineId: "1", // American
    priceRange: 3, // Upscale
    rating: 4.4,
    notes: "Fine dining establishment known as the most romantic restaurant in Bloomington. Features steaks and seafood.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free menu items available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian options including salads and pasta" }
    ]
  },
  {
    name: "Revery",
    address: "704 McGregor Street, Bloomington, IL 61701",
    cuisineId: "1", // American
    priceRange: 3, // Upscale
    rating: 4.5,
    notes: "Newest fine dining addition (opened 2024), focus on high-quality ingredients and contemporary American cuisine.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Accommodates gluten-free dietary needs" },
      { dietaryRestrictionId: "2", notes: "Vegetarian options available" },
      { dietaryRestrictionId: "3", notes: "Vegan preparations can be arranged" }
    ]
  },

  // Italian & Pizza
  {
    name: "Avanti's Italian Restaurant (Empire)",
    address: "3302 East Empire Street, Bloomington, IL 61704",
    phone: "(309) 662-4436",
    cuisineId: "2", // Italian
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Local Italian chain famous for their Gondola sandwich and traditional Italian specialties.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free pasta available" },
      { dietaryRestrictionId: "2", notes: "Multiple vegetarian pasta and pizza options" }
    ]
  },
  {
    name: "Avanti's Italian Restaurant (Normal)",
    address: "407 South Main Street, Normal, IL 61761",
    cuisineId: "2", // Italian
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Sister location of the beloved Italian restaurant, same menu including famous Gondola sandwich.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free pasta options" },
      { dietaryRestrictionId: "2", notes: "Vegetarian Italian dishes and pizzas" }
    ]
  },
  {
    name: "Firehouse Pizza",
    address: "Downtown Bloomington, IL",
    cuisineId: "2", // Italian
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Local pizza joint with casual dining atmosphere, known for wood-fired pizzas.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "2", notes: "Vegetarian pizza options available" },
      { dietaryRestrictionId: "3", notes: "Vegan cheese available for pizzas" }
    ]
  },
  {
    name: "Monical's Pizza",
    address: "Bloomington, IL",
    cuisineId: "2", // Italian
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Central Illinois pizza chain known for thin-crust pizza with unique sauce.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free crust available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian pizza toppings" }
    ]
  },

  // Asian Cuisine
  {
    name: "Kura Revolving Sushi Bar",
    address: "1500 East Empire Street, Suite A1, Bloomington, IL 61704",
    cuisineId: "5", // Japanese
    priceRange: 2, // Moderate
    rating: 4.5,
    notes: "First-of-its-kind revolving sushi experience with two-level conveyor belt system.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Sashimi and rice dishes are naturally gluten-free" },
      { dietaryRestrictionId: "2", notes: "Vegetarian sushi rolls available" },
      { dietaryRestrictionId: "6", notes: "Can prepare shellfish-free options" }
    ]
  },
  {
    name: "Anju Above",
    address: "220 East Front Street, Bloomington, IL 61701",
    phone: "(309) 828-8704",
    cuisineId: "5", // Japanese (Asian Fusion)
    priceRange: 2, // Moderate
    rating: 4.4,
    notes: "Globally-inspired small plates with sustainable farming practices and Asian fusion cuisine.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free options available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian small plates" },
      { dietaryRestrictionId: "3", notes: "Vegan preparations available" }
    ]
  },
  {
    name: "Ching's Chinese Restaurant",
    address: "Bloomington, IL",
    cuisineId: "4", // Chinese
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Fast-casual Chinese restaurant with authentic flavors and traditional dishes.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Steamed rice dishes without soy sauce" },
      { dietaryRestrictionId: "2", notes: "Vegetable stir-fries and tofu dishes" },
      { dietaryRestrictionId: "3", notes: "Vegan vegetable preparations" }
    ]
  },

  // Mexican & Latin American
  {
    name: "Ancho & Agave",
    address: "3006 East Empire Street, Bloomington, IL 61704",
    phone: "(309) 590-3200",
    cuisineId: "3", // Mexican
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Authentic Mexican cuisine with fresh ingredients and traditional preparations.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Corn tortillas and many dishes are naturally gluten-free" },
      { dietaryRestrictionId: "2", notes: "Vegetarian options with beans and cheese" },
      { dietaryRestrictionId: "3", notes: "Vegan bean and vegetable dishes" }
    ]
  },
  {
    name: "Fiesta Ranchera",
    address: "Bloomington, IL",
    cuisineId: "3", // Mexican
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Traditional Mexican restaurant with family atmosphere and authentic Mexican dishes.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Corn tortilla-based dishes" },
      { dietaryRestrictionId: "2", notes: "Vegetarian Mexican specialties" }
    ]
  },

  // Barbecue
  {
    name: "Bandana's Bar-B-Q",
    address: "502 IAA Drive, Bloomington, IL 61701",
    phone: "(309) 662-7427",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Regional BBQ chain with slow-smoked meats and traditional barbecue sides.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Some meats are gluten-free when ordered without sauce" },
      { dietaryRestrictionId: "2", notes: "Vegetarian sides available" }
    ]
  },
  {
    name: "Famous Dave's BBQ",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 3.9,
    notes: "National chain known for award-winning ribs and variety of smoked meats.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free options available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian sides and salads" }
    ]
  },
  {
    name: "Annie's Eats",
    address: "606 N Clinton Street, Bloomington, IL 61701",
    phone: "(309) 824-0803",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Local BBQ spot with homestyle cooking and comfort food specialties.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "2", notes: "Vegetarian options and sides available" }
    ]
  },

  // American Casual Dining
  {
    name: "Barrel House",
    address: "9 Brickyard Drive, Bloomington, IL 61704",
    phone: "(309) 590-3369",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Popular local gastropub with creative American dishes, steamed buns and craft cocktails.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free options available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian gastropub dishes" },
      { dietaryRestrictionId: "3", notes: "Vegan options can be prepared" }
    ]
  },
  {
    name: "Wesley's Grill",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Casual dining with American favorites and fresh seafood specialties.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free preparation available for seafood" },
      { dietaryRestrictionId: "2", notes: "Vegetarian options available" }
    ]
  },
  {
    name: "That Burger Joint",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 1, // Budget
    rating: 4.2,
    notes: "Local burger spot with creative burger combinations and gourmet options.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free buns available" },
      { dietaryRestrictionId: "2", notes: "Veggie burger options" },
      { dietaryRestrictionId: "3", notes: "Plant-based burger patties available" }
    ]
  },
  {
    name: "Rosie's Pub",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Historic pub located in Abraham Lincoln's former law office. American taphouse fare with flatbreads and burgers.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "2", notes: "Vegetarian flatbreads and pub fare" }
    ]
  },

  // Breakfast & Brunch
  {
    name: "Froth & Fork",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Popular breakfast and brunch spot known for creative brunch items and quality coffee.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free breakfast options" },
      { dietaryRestrictionId: "2", notes: "Vegetarian breakfast and brunch items" }
    ]
  },
  {
    name: "Nautical Bowls",
    address: "112 E Beaufort Street, Normal, IL 61761",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.4,
    notes: "Acai bowls and superfood breakfast options focusing on healthy ingredients.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free bowl options" },
      { dietaryRestrictionId: "2", notes: "Vegetarian superfood bowls" },
      { dietaryRestrictionId: "3", notes: "Vegan acai and smoothie bowls" },
      { dietaryRestrictionId: "4", notes: "Dairy-free options available" }
    ]
  },

  // Pubs & Bars with Food
  {
    name: "A&P Tap",
    address: "721 West Chestnut Street, Bloomington, IL 61701",
    phone: "(309) 828-5581",
    cuisineId: "1", // American
    priceRange: 1, // Budget
    rating: 3.9,
    notes: "Local neighborhood bar with classic pub food and casual atmosphere.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "2", notes: "Vegetarian bar food options" }
    ]
  },
  {
    name: "Maggie Miley's",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Authentic Irish pub with traditional Irish fare and atmosphere.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "2", notes: "Vegetarian Irish dishes available" }
    ]
  },
  {
    name: "Killarney's Irish Pub",
    address: "523 N Main Street, Bloomington, IL 61701",
    phone: "(309) 828-1186",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Irish pub with traditional menu and authentic Irish atmosphere.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "2", notes: "Vegetarian options and Irish sides" }
    ]
  },

  // Specialty & Unique Dining
  {
    name: "Mystic Kitchen & Tasting Room",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.5,
    notes: "Bohemian-style restaurant with eclectic menu and wine focus, known for charcuterie boards.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "2", notes: "Vegetarian charcuterie and cheese options" },
      { dietaryRestrictionId: "3", notes: "Vegan cheese and wine pairings available" }
    ]
  },
  {
    name: "Jack's Restaurant",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.4,
    notes: "Highly-rated local establishment with consistently excellent reviews.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free options available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian menu items" }
    ]
  },
  {
    name: "Pop Up Chicken Shop",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 1, // Budget
    rating: 4.3,
    notes: "Casual chicken restaurant with unique preparation and creative chicken variations.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free chicken preparation available" }
    ]
  },

  // Bakeries & Cafes
  {
    name: "Ivy Lane Bakery",
    address: "405 N Main Street, Bloomington, IL 61701",
    phone: "(309) 585-1774",
    cuisineId: "1", // American
    priceRange: 1, // Budget
    rating: 4.5,
    notes: "Local bakery with fresh baked goods including scones, muffins, quiche, and cookies.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free baked goods available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian quiche and baked items" }
    ]
  },
  {
    name: "Bakery and Pickle",
    address: "513 N Main Street, Bloomington, IL 61701",
    phone: "(309) 533-1500",
    cuisineId: "1", // American
    priceRange: 1, // Budget
    rating: 4.2,
    notes: "Local bakery with deli items and fresh baked goods.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "2", notes: "Vegetarian bakery and deli items" }
    ]
  },

  // Fast Casual & Healthy Options
  {
    name: "CoreLife Eatery",
    address: "Bloomington, IL",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Health-focused fast casual with fresh ingredients and customizable healthy meals.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free grain bowls and salads" },
      { dietaryRestrictionId: "2", notes: "Extensive vegetarian options" },
      { dietaryRestrictionId: "3", notes: "Vegan protein and dressing options" },
      { dietaryRestrictionId: "4", notes: "Dairy-free meal combinations" }
    ]
  },
  {
    name: "Heaterz Hot Chicken",
    address: "100 S Fell Street, Normal, IL 61761",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Nashville-style hot chicken restaurant (opened 2024) specializing in spicy chicken preparations.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free chicken preparation available" }
    ]
  },
  {
    name: "Epic Burger",
    address: "305 N Veterans Parkway, Bloomington, IL 61704",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Burger restaurant with diverse gourmet burger options (opened 2024).",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free buns available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian burger options" },
      { dietaryRestrictionId: "3", notes: "Plant-based burger patties" }
    ]
  }
];

async function addTop60Restaurants() {
  try {
    console.log('🏆 Starting to add top 60 restaurants to complete the Bloomington-Normal collection...');
    console.log(`👤 Using familyId: ${userId}`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const restaurantData of additionalRestaurants) {
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
    
    console.log(`\n🎉 Completed! Added ${addedCount} restaurants, skipped ${skippedCount} existing restaurants.`);
    
    // Show updated count
    const allRestaurants = await db.collection('restaurants')
      .where('familyId', '==', userId)
      .get();
    
    console.log(`📊 Total restaurants in database: ${allRestaurants.size}`);
    
    // Summary by cuisine and price range
    const cuisineCounts = {};
    const priceCounts = { 1: 0, 2: 0, 3: 0 };
    
    allRestaurants.forEach(doc => {
      const data = doc.data();
      const cuisineMap = {
        '1': 'American',
        '2': 'Italian', 
        '3': 'Mexican',
        '4': 'Chinese',
        '5': 'Japanese/Asian',
        '6': 'Indian',
        '7': 'Thai',
        '11': 'Vietnamese',
        '12': 'Korean'
      };
      
      const cuisine = cuisineMap[data.cuisineId] || 'Other';
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
      priceCounts[data.priceRange] = (priceCounts[data.priceRange] || 0) + 1;
    });
    
    console.log('\n📊 Restaurant collection summary:');
    console.log('By Cuisine:');
    Object.entries(cuisineCounts).forEach(([cuisine, count]) => {
      console.log(`   ${cuisine}: ${count} restaurant${count > 1 ? 's' : ''}`);
    });
    
    console.log('\nBy Price Range:');
    console.log(`   Budget ($): ${priceCounts[1]} restaurants`);
    console.log(`   Moderate ($$): ${priceCounts[2]} restaurants`);
    console.log(`   Upscale ($$$): ${priceCounts[3]} restaurants`);
    
  } catch (error) {
    console.error('❌ Error adding restaurants:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
addTop60Restaurants();