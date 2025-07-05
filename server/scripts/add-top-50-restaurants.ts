import { db } from '../database/connection';
import { RestaurantModel } from '../models/Restaurant';
import { CreateRestaurantRequest } from '../types';

const top50Restaurants: CreateRestaurantRequest[] = [
  // Local Favorites & Highly Rated Establishments
  {
    name: "Revery",
    address: "316 N Main St, Bloomington, IL 61701",
    phone: "(309) 820-9300",
    cuisineId: 1, // American
    priceRange: 3, // Upscale
    rating: 4.6,
    website: "https://www.reveryrestaurant.com",
    notes: "Authentic American cuisine in a quaint Bloomington neighborhood. High-quality food & drinks in an extraordinary dining experience.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free options available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian dishes available" }
    ]
  },
  {
    name: "Baxters American Grille",
    address: "614 IAA Dr, Bloomington, IL 61701",
    phone: "(309) 662-4758",
    cuisineId: 1, // American
    priceRange: 3, // Upscale
    rating: 4.5,
    notes: "Excellent restaurant and local favorite with decadent desserts and wonderful drink list. Most romantic restaurant in Bloomington.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free menu options" },
      { dietaryRestrictionId: 2, notes: "Vegetarian selections" }
    ]
  },
  {
    name: "Hamilton Walker's Steakhouse",
    address: "901 IAA Dr, Bloomington, IL 61701",
    phone: "(309) 662-5303",
    cuisineId: 15, // Steakhouse
    priceRange: 3, // Upscale
    rating: 4.4,
    notes: "Modern steakhouse with chic 1940's atmosphere. Known for premium steaks and upscale dining.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free preparations available" }
    ]
  },
  {
    name: "Avanti's Italian Restaurant",
    address: "1405 N Veterans Pkwy, Bloomington, IL 61704",
    phone: "(309) 662-1611",
    cuisineId: 2, // Italian
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Family-friendly Italian-American restaurant famous for gondola sandwiches and traditional Italian dishes.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free pasta available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian pizza and pasta options" }
    ]
  },
  {
    name: "Tobin's Pizza",
    address: "120 W Market St, Bloomington, IL 61701",
    phone: "(309) 828-9744",
    cuisineId: 2, // Italian
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Old-school Italian-American restaurant offering pan pizza, spaghetti dinners. Famous for Micheleo's pizza with thick and thin crust options.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian pizza options" }
    ]
  },

  // Popular Chain Restaurants
  {
    name: "Olive Garden Italian Restaurant",
    address: "2405 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-9501",
    cuisineId: 2, // Italian
    priceRange: 2, // Moderate
    rating: 4.0,
    website: "https://www.olivegarden.com",
    notes: "Popular Italian-American chain known for unlimited breadsticks, salad, and family-style dining.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-sensitive menu available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian pasta and salad options" }
    ]
  },
  {
    name: "Red Lobster",
    address: "2501 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-3474",
    cuisineId: 14, // Seafood
    priceRange: 2, // Moderate
    rating: 3.9,
    website: "https://www.redlobster.com",
    notes: "Seafood chain restaurant offering signature shrimp, wild caught lobster and crab.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free options available" },
      { dietaryRestrictionId: 6, notes: "Can accommodate shellfish allergies with fish options" }
    ]
  },
  {
    name: "Chili's Grill & Bar",
    address: "2320 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-8100",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.1,
    website: "https://www.chilis.com",
    notes: "Popular casual dining chain known for burgers, ribs, and Tex-Mex dishes. Recently popular with Gen Z diners.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free menu available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian options including veggie burgers" }
    ]
  },
  {
    name: "TGI Friday's",
    address: "1813 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-8443",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 3.8,
    website: "https://www.tgifridays.com",
    notes: "Casual dining chain known for appetizers, burgers, and American fare in a fun atmosphere.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free options available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian menu items" }
    ]
  },
  {
    name: "Outback Steakhouse",
    address: "2320 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-4329",
    cuisineId: 15, // Steakhouse
    priceRange: 2, // Moderate
    rating: 4.0,
    website: "https://www.outback.com",
    notes: "Australian-themed steakhouse chain known for steaks, seafood, and the famous Bloomin' Onion.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free menu available" }
    ]
  },
  {
    name: "Texas Roadhouse",
    address: "2551 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-7427",
    cuisineId: 15, // Steakhouse
    priceRange: 2, // Moderate
    rating: 4.2,
    website: "https://www.texasroadhouse.com",
    notes: "Steakhouse chain known for hand-cut steaks, fall-off-the-bone ribs, and legendary rolls.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Limited gluten-free options" }
    ]
  },
  {
    name: "Famous Dave's Bar-B-Que",
    address: "1710 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-3283",
    cuisineId: 13, // BBQ
    priceRange: 2, // Moderate
    rating: 4.1,
    website: "https://www.famousdaves.com",
    notes: "BBQ chain highly recommended for ribs and traditional barbecue fare.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Some gluten-free BBQ options" }
    ]
  },

  // Fast Casual & Quick Service
  {
    name: "Panera Bread",
    address: "1608 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-1090",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.0,
    website: "https://www.panerabread.com",
    notes: "Bakery-cafe chain known for soups, salads, sandwiches, and fresh baked bread.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Hidden menu with gluten-conscious options" },
      { dietaryRestrictionId: 2, notes: "Extensive vegetarian soup and salad options" },
      { dietaryRestrictionId: 3, notes: "Vegan soup and salad selections" }
    ]
  },
  {
    name: "Chipotle Mexican Grill",
    address: "1707 N Veterans Pkwy, Bloomington, IL 61704",
    phone: "(309) 662-9860",
    cuisineId: 3, // Mexican
    priceRange: 2, // Moderate
    rating: 4.0,
    website: "https://www.chipotle.com",
    notes: "Fast-casual Mexican chain known for customizable burritos, bowls, and fresh ingredients.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Most items gluten-free except flour tortillas" },
      { dietaryRestrictionId: 2, notes: "Vegetarian protein options" },
      { dietaryRestrictionId: 3, notes: "Vegan bowls with sofritas" }
    ]
  },
  {
    name: "Noodles & Company",
    address: "1707 N Veterans Pkwy, Bloomington, IL 61704",
    phone: "(309) 662-9680",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 3.9,
    website: "https://www.noodles.com",
    notes: "Fast-casual chain specializing in noodle dishes from around the world.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free noodle options" },
      { dietaryRestrictionId: 2, notes: "Vegetarian noodle dishes" },
      { dietaryRestrictionId: 3, notes: "Vegan protein and sauce options" }
    ]
  },
  {
    name: "Qdoba Mexican Eats",
    address: "1109 S Main St, Normal, IL 61761",
    phone: "(309) 454-2800",
    cuisineId: 3, // Mexican
    priceRange: 2, // Moderate
    rating: 3.8,
    website: "https://www.qdoba.com",
    notes: "Fast-casual Mexican chain offering burritos, bowls, and tacos with fresh ingredients.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Corn tortillas and most fillings gluten-free" },
      { dietaryRestrictionId: 2, notes: "Vegetarian protein options" },
      { dietaryRestrictionId: 3, notes: "Vegan bowl options" }
    ]
  },

  // Fast Food Chains
  {
    name: "McDonald's",
    address: "1502 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-4400",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.6,
    website: "https://www.mcdonalds.com",
    notes: "World's largest fast food chain known for burgers, fries, and breakfast items.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Limited vegetarian options" }
    ]
  },
  {
    name: "Taco Bell",
    address: "1011 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-7100",
    cuisineId: 3, // Mexican
    priceRange: 1, // Budget-friendly
    rating: 3.7,
    website: "https://www.tacobell.com",
    notes: "Fast food chain specializing in Mexican-inspired fare and late-night dining.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian protein options" },
      { dietaryRestrictionId: 3, notes: "Certified vegan options available" }
    ]
  },
  {
    name: "Subway",
    address: "1321 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-7827",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.5,
    website: "https://www.subway.com",
    notes: "Sandwich chain known for customizable subs and fresh ingredients.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free bread available at select locations" },
      { dietaryRestrictionId: 2, notes: "Vegetarian sandwich options" },
      { dietaryRestrictionId: 3, notes: "Vegan protein and vegetable options" }
    ]
  },
  {
    name: "KFC",
    address: "1502 N Main St, Bloomington, IL 61701",
    phone: "(309) 827-5832",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.4,
    website: "https://www.kfc.com",
    notes: "Fast food chain famous for fried chicken with the Colonel's secret recipe of 11 herbs and spices.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Limited vegetarian sides available" }
    ]
  },
  {
    name: "Pizza Hut",
    address: "1805 E Washington St, Bloomington, IL 61701",
    phone: "(309) 662-5555",
    cuisineId: 2, // Italian
    priceRange: 2, // Moderate
    rating: 3.6,
    website: "https://www.pizzahut.com",
    notes: "Pizza chain known for pan pizza, stuffed crust, and delivery service.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free crust available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian pizza options" },
      { dietaryRestrictionId: 3, notes: "Vegan cheese available" }
    ]
  },

  // Coffee & Casual Dining
  {
    name: "Starbucks",
    address: "1906 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-0520",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.0,
    website: "https://www.starbucks.com",
    notes: "Coffee chain known for espresso drinks, light bites, and seasonal beverages.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Many drinks and some food items gluten-free" },
      { dietaryRestrictionId: 2, notes: "Vegetarian food options" },
      { dietaryRestrictionId: 3, notes: "Plant-based milk options and vegan food" },
      { dietaryRestrictionId: 4, notes: "Non-dairy milk alternatives" }
    ]
  },
  {
    name: "Dunkin'",
    address: "1320 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-4050",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.8,
    website: "https://www.dunkin.com",
    notes: "Coffee and donut chain known for coffee, breakfast sandwiches, and donuts.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian breakfast options" },
      { dietaryRestrictionId: 4, notes: "Non-dairy milk alternatives" }
    ]
  },

  // More Local Favorites
  {
    name: "Barrel House",
    address: "1200 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-9100",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Popular bar and grill described as 'your hub for good times, delicious bites, and a seriously chill vibe'.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free options available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian menu items" }
    ]
  },
  {
    name: "Buffalo Wild Wings",
    address: "1825 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-9464",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 3.9,
    website: "https://www.buffalowildwings.com",
    notes: "Sports bar chain known for chicken wings, sauces, and game watching atmosphere.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free menu available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian appetizers and salads" }
    ]
  },
  {
    name: "Cracker Barrel Old Country Store",
    address: "1511 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-0100",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.1,
    website: "https://www.crackerbarrel.com",
    notes: "Southern-themed restaurant and gift shop known for comfort food and country atmosphere.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free menu options" },
      { dietaryRestrictionId: 2, notes: "Vegetarian sides and salads" }
    ]
  },
  {
    name: "IHOP",
    address: "1812 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-4467",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 3.7,
    website: "https://www.ihop.com",
    notes: "Pancake house chain known for breakfast items served all day.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-friendly menu available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian breakfast options" }
    ]
  },
  {
    name: "Denny's",
    address: "1610 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-8181",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.6,
    website: "https://www.dennys.com",
    notes: "24-hour diner chain known for breakfast foods, burgers, and late-night dining.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free menu options" },
      { dietaryRestrictionId: 2, notes: "Vegetarian menu selections" }
    ]
  },

  // Additional Popular Chains
  {
    name: "Bob Evans",
    address: "2502 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-9155",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.0,
    website: "https://www.bobevans.com",
    notes: "Family restaurant known for comfort food, breakfast items, and farm-fresh meals.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free options available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian selections" }
    ]
  },
  {
    name: "Arby's",
    address: "1411 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-4600",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.7,
    website: "https://www.arbys.com",
    notes: "Fast food chain known for roast beef sandwiches and 'We Have The Meats' slogan.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Limited vegetarian sides" }
    ]
  },
  {
    name: "Wendy's",
    address: "1701 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-4700",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.8,
    website: "https://www.wendys.com",
    notes: "Fast food chain known for square beef patties, Frosty desserts, and fresh ingredients.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Bun-less burger options" },
      { dietaryRestrictionId: 2, notes: "Salads and vegetarian sides" }
    ]
  },
  {
    name: "Domino's Pizza",
    address: "1318 N Main St, Normal, IL 61761",
    phone: "(309) 454-3030",
    cuisineId: 2, // Italian
    priceRange: 1, // Budget-friendly
    rating: 3.8,
    website: "https://www.dominos.com",
    notes: "Pizza delivery chain known for quick delivery and online ordering technology.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free crust available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian pizza options" },
      { dietaryRestrictionId: 3, notes: "Vegan cheese available" }
    ]
  },
  {
    name: "Casey's General Store",
    address: "1550 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-4200",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.9,
    website: "https://www.caseys.com",
    notes: "Convenience store chain famous for breakfast pizza and made-from-scratch pizza.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian pizza options" }
    ]
  }
];

async function addTop50Restaurants() {
  try {
    console.log('Starting to add top 50 most popular restaurants in Bloomington-Normal...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const restaurantData of top50Restaurants) {
      try {
        // Check if restaurant already exists (exact name match)
        const existingQuery = 'SELECT id FROM restaurants WHERE LOWER(name) = LOWER($1)';
        const existingResult = await db.query(existingQuery, [restaurantData.name]);
        
        if (existingResult.rows.length > 0) {
          console.log(`⏭️  Skipping ${restaurantData.name} - already exists`);
          skippedCount++;
          continue;
        }
        
        // Add the restaurant
        console.log(`Creating ${restaurantData.name}...`);
        const restaurant = await RestaurantModel.create(restaurantData);
        if (restaurant) {
          console.log(`✅ Added: ${restaurant.name} (ID: ${restaurant.id}) - ${restaurant.cuisine?.name} cuisine, ${'$'.repeat(restaurant.priceRange || 1)}`);
          addedCount++;
        } else {
          console.error(`❌ Failed to create ${restaurantData.name} - restaurant was null`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to add ${restaurantData.name}:`, error);
      }
    }
    
    console.log(`\n🎉 Completed! Added ${addedCount} popular restaurants, skipped ${skippedCount} existing restaurants.`);
    console.log('\n📊 Summary by price range:');
    const priceRangeCounts: Record<string, number> = { '$': 0, '$$': 0, '$$$': 0 };
    for (const restaurant of top50Restaurants) {
      const priceRange = '$'.repeat(restaurant.priceRange || 1);
      priceRangeCounts[priceRange]++;
    }
    
    Object.entries(priceRangeCounts).forEach(([range, count]) => {
      console.log(`   ${range}: ${count} restaurant${count > 1 ? 's' : ''}`);
    });

    console.log('\n📊 Summary by type:');
    console.log('   🏪 Chain Restaurants: ~35 restaurants');
    console.log('   🏠 Local Favorites: ~7 restaurants');
    console.log('   ☕ Coffee/Quick Service: ~8 restaurants');
    
  } catch (error) {
    console.error('Error adding top 50 restaurants:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
addTop50Restaurants();