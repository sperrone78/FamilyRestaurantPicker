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
  console.error('❌ Please provide a user ID: node scripts/add-bloomington-restaurants-firestore.js YOUR_USER_ID');
  process.exit(1);
}

const restaurants = [
  {
    name: "Epiphany Farms Restaurant",
    address: "220 E Front St, Bloomington, IL 61701",
    phone: "(309) 828-2323",
    cuisineId: "1", // American
    priceRange: 3, // Upscale
    rating: 4.5,
    website: "https://www.epiphanyfarms.com",
    notes: "Farm-to-table restaurant featuring locally sourced ingredients. Known for creative seasonal menu and craft cocktails.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Multiple gluten-free options available on menu" },
      { dietaryRestrictionId: "2", notes: "Several vegetarian dishes featuring local vegetables" },
      { dietaryRestrictionId: "3", notes: "Vegan options available, chef can modify dishes" },
      { dietaryRestrictionId: "4", notes: "Dairy-free preparations available upon request" }
    ]
  },
  {
    name: "DESTIHL Restaurant & Brew Works",
    address: "318 S Towanda Ave, Normal, IL 61761",
    phone: "(309) 862-2337",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.3,
    website: "https://www.destihl.com",
    notes: "Brewpub with craft beer and elevated comfort food. Known for their house-brewed beers and gastropub menu.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free menu available with GF beer options" },
      { dietaryRestrictionId: "2", notes: "Good selection of vegetarian options" },
      { dietaryRestrictionId: "3", notes: "Several vegan dishes available" }
    ]
  },
  {
    name: "The Alamo II",
    address: "318 N Main St, Bloomington, IL 61701",
    phone: "(309) 828-2388",
    cuisineId: "3", // Mexican
    priceRange: 1, // Budget-friendly
    rating: 4.2,
    notes: "Local favorite for authentic Mexican cuisine. Family-owned restaurant serving traditional dishes since 1970s.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Corn tortillas available, many naturally gluten-free dishes" },
      { dietaryRestrictionId: "2", notes: "Vegetarian options include bean and cheese dishes" },
      { dietaryRestrictionId: "3", notes: "Vegan options available with beans, rice, and vegetables" }
    ]
  },
  {
    name: "Portillo's",
    address: "1511 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-8411",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 4.1,
    website: "https://www.portillos.com",
    notes: "Chicago-style hot dogs, Italian beef, and chocolate cake. Popular chain known for authentic Chicago flavors.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Limited gluten-free options available" },
      { dietaryRestrictionId: "2", notes: "Salads and some sides are vegetarian" }
    ]
  },
  {
    name: "Lucca Grill",
    address: "116 E Market St, Bloomington, IL 61701",
    phone: "(309) 828-7521",
    cuisineId: "2", // Italian
    priceRange: 2, // Moderate
    rating: 4.4,
    notes: "Historic Italian restaurant established in 1936. Known for traditional Italian dishes and cozy atmosphere.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free pasta available upon request" },
      { dietaryRestrictionId: "2", notes: "Multiple vegetarian pasta and pizza options" },
      { dietaryRestrictionId: "3", notes: "Vegan cheese available for pizzas and pasta" }
    ]
  },
  {
    name: "Biaggi's Ristorante Italiano",
    address: "1501 River Rd, Bloomington, IL 61701",
    phone: "(309) 662-9922",
    cuisineId: "2", // Italian
    priceRange: 2, // Moderate
    rating: 4.0,
    website: "https://www.biaggis.com",
    notes: "Upscale Italian chain restaurant with extensive wine list and contemporary Italian cuisine.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Dedicated gluten-free menu with pasta, pizza, and entrees" },
      { dietaryRestrictionId: "2", notes: "Good selection of vegetarian dishes" },
      { dietaryRestrictionId: "3", notes: "Vegan options available with plant-based cheese" }
    ]
  },
  {
    name: "Pub II",
    address: "102 N Center St, Bloomington, IL 61701",
    phone: "(309) 829-2233",
    cuisineId: "1", // American
    priceRange: 1, // Budget-friendly
    rating: 4.0,
    notes: "Local sports bar and grill. Known for burgers, wings, and casual atmosphere. Popular with locals and students.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "2", notes: "Veggie burgers and salads available" }
    ]
  },
  {
    name: "Medici in Normal",
    address: "120 S Main St, Normal, IL 61761",
    phone: "(309) 452-6334",
    cuisineId: "1", // American
    priceRange: 1, // Budget-friendly
    rating: 4.2,
    notes: "Coffeehouse and restaurant popular with students. Known for coffee, sandwiches, and casual dining.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free bread available for sandwiches" },
      { dietaryRestrictionId: "2", notes: "Multiple vegetarian sandwich and salad options" },
      { dietaryRestrictionId: "3", notes: "Vegan options including plant-based milk for coffee" }
    ]
  },
  {
    name: "Ninja Japanese Steakhouse",
    address: "1512 E Empire St, Bloomington, IL 61704",
    phone: "(309) 663-8888",
    cuisineId: "5", // Japanese
    priceRange: 3, // Upscale
    rating: 4.1,
    notes: "Hibachi-style Japanese steakhouse with teppanyaki tables and sushi bar.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Gluten-free soy sauce available, many sashimi options" },
      { dietaryRestrictionId: "2", notes: "Vegetable hibachi and vegetarian sushi rolls available" },
      { dietaryRestrictionId: "6", notes: "Can prepare shellfish-free dishes upon request" }
    ]
  },
  {
    name: "Applebee's Grill + Bar",
    address: "1823 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-7288",
    cuisineId: "1", // American
    priceRange: 2, // Moderate
    rating: 3.8,
    website: "https://www.applebees.com",
    notes: "Chain restaurant with American fare and bar. Familiar menu with steaks, burgers, and appetizers.",
    dietaryAccommodations: [
      { dietaryRestrictionId: "1", notes: "Limited gluten-sensitive menu available" },
      { dietaryRestrictionId: "2", notes: "Vegetarian options include salads and pasta" }
    ]
  }
];

async function addBloomingtonRestaurants() {
  try {
    console.log('🍽️  Starting to add Bloomington-Normal restaurants to Firestore...');
    console.log(`👤 Using familyId: ${userId}`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const restaurantData of restaurants) {
      try {
        // Check if restaurant already exists for this user
        const existingQuery = await db.collection('restaurants')
          .where('name', '==', restaurantData.name)
          .where('address', '==', restaurantData.address)
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
        console.log(`✅ Added: ${restaurantData.name} (ID: ${docRef.id})`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to add ${restaurantData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Completed! Added ${addedCount} restaurants, skipped ${skippedCount} existing restaurants.`);
    console.log(`📊 Total restaurants in database for user: ${addedCount + skippedCount}`);
    
  } catch (error) {
    console.error('❌ Error adding restaurants:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
addBloomingtonRestaurants();