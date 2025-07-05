import { db } from '../database/connection';
import { RestaurantModel } from '../models/Restaurant';
import { CreateRestaurantRequest } from '../types';

const chineseRestaurants: CreateRestaurantRequest[] = [
  {
    name: "Hot Wok Express",
    address: "401 N Veterans Pkwy #2, Bloomington, IL 61704",
    phone: "(309) 663-5300",
    cuisineId: 4, // Chinese
    priceRange: 1, // Budget-friendly
    rating: 4.2,
    website: "https://www.hotwokexpressil.com",
    notes: "Authentic Chinese cuisine with convenient location and affordable prices. Known for huge portions, quick and friendly service. Offers dine-in and takeout.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Some dishes can be prepared gluten-free upon request" },
      { dietaryRestrictionId: 2, notes: "Vegetarian dishes and tofu options available" },
      { dietaryRestrictionId: 3, notes: "Vegan options with vegetable dishes and tofu" }
    ]
  },
  {
    name: "Chi Family Express",
    address: "1320 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-8888",
    cuisineId: 4, // Chinese
    priceRange: 1, // Budget-friendly
    rating: 4.0,
    website: "https://chifamilyexpress.com",
    notes: "Fresh Chinese food with takeout and delivery available. Local small business offering authentic Chinese dishes.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian options available" },
      { dietaryRestrictionId: 3, notes: "Vegan vegetable dishes" }
    ]
  },
  {
    name: "China Star",
    address: "1612 N Main St, Bloomington, IL 61701",
    phone: "(309) 827-7888",
    cuisineId: 4, // Chinese
    priceRange: 1, // Budget-friendly
    rating: 3.9,
    website: "https://www.chinastarbl.com",
    notes: "Authentic Chinese cuisine with convenient location and affordable prices. Natural choice for eat-in or takeout meals.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian menu options" },
      { dietaryRestrictionId: 3, notes: "Vegan dishes available" }
    ]
  },
  {
    name: "Ching's Chinese Restaurant",
    address: "1320 W College Ave, Normal, IL 61761",
    phone: "(309) 452-8888",
    cuisineId: 4, // Chinese
    priceRange: 1, // Budget-friendly
    rating: 4.1,
    website: "https://www.chingsnormal.com",
    notes: "Authentic Chinese cuisine in Normal with dine-in and takeout. Convenient location with affordable prices and extensive menu.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Special diet menu available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian menu with 10 options" },
      { dietaryRestrictionId: 3, notes: "Vegan vegetable dishes" }
    ]
  },
  {
    name: "Panda Express",
    address: "1901 W Market St, Bloomington, IL 61701",
    phone: "(309) 665-0033",
    cuisineId: 4, // Chinese
    priceRange: 1, // Budget-friendly
    rating: 3.8,
    website: "https://www.pandaexpress.com",
    notes: "Popular Chinese-American fast food chain known for Orange Chicken, Chow Mein, and Fried Rice. Quick service with consistent quality.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Some items are gluten-free, check nutrition guide" },
      { dietaryRestrictionId: 2, notes: "Vegetarian options including Chow Mein and vegetable dishes" },
      { dietaryRestrictionId: 3, notes: "Limited vegan options, check ingredients" }
    ]
  },
  {
    name: "Grand Cafe",
    address: "1502 E Washington St, Bloomington, IL 61701",
    phone: "(309) 827-7700",
    cuisineId: 4, // Chinese
    priceRange: 2, // Moderate
    rating: 4.0,
    website: "https://www.grandcafellc.com",
    notes: "Asian cuisine restaurant using fresh produce, meats, and spices. Wide variety of Chinese-American options with restaurant and catering menus.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Fresh ingredients, can accommodate dietary requests" },
      { dietaryRestrictionId: 2, notes: "Vegetarian Chinese-American dishes" },
      { dietaryRestrictionId: 3, notes: "Vegan options with fresh vegetables" }
    ]
  },
  {
    name: "Jing's Hot Wok Chinese Restaurant",
    address: "1815 E Washington St, Bloomington, IL 61701",
    phone: "(309) 663-5300",
    cuisineId: 4, // Chinese
    priceRange: 1, // Budget-friendly
    rating: 4.1,
    notes: "Chinese restaurant known for fastest delivery in Bloomington. Serves Bloomington & Normal zip codes. Family-owned with traditional Chinese dishes.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian Chinese dishes available" },
      { dietaryRestrictionId: 3, notes: "Vegan vegetable preparations" }
    ]
  }
];

async function addChineseRestaurants() {
  try {
    console.log('🥢 Adding missing Chinese restaurants to Bloomington-Normal database...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const restaurantData of chineseRestaurants) {
      try {
        // Check if restaurant already exists
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
          console.log(`✅ Added: ${restaurant.name} (ID: ${restaurant.id}) - ${restaurant.cuisine?.name} cuisine`);
          addedCount++;
        } else {
          console.error(`❌ Failed to create ${restaurantData.name} - restaurant was null`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to add ${restaurantData.name}:`, error);
      }
    }
    
    // Get final Chinese restaurant count and list
    const chineseCountResult = await db.query(`
      SELECT COUNT(*) as chinese_count 
      FROM restaurants r 
      JOIN cuisines c ON r.cuisine_id = c.id 
      WHERE c.name = 'Chinese'
    `);
    const chineseCount = chineseCountResult.rows[0].chinese_count;
    
    console.log(`\n🎉 Chinese Restaurant Addition Complete!`);
    console.log(`   ✅ Added: ${addedCount} new Chinese restaurants`);
    console.log(`   ⏭️  Skipped: ${skippedCount} existing restaurants`);
    console.log(`   🥢 Total Chinese restaurants: ${chineseCount}`);
    
    console.log('\n🥢 All Chinese restaurants in Bloomington-Normal:');
    const chineseListResult = await db.query(`
      SELECT r.name, r.address, r.rating 
      FROM restaurants r 
      JOIN cuisines c ON r.cuisine_id = c.id 
      WHERE c.name = 'Chinese'
      ORDER BY r.rating DESC, r.name
    `);
    
    chineseListResult.rows.forEach(restaurant => {
      console.log(`   🥢 ${restaurant.name} (${restaurant.rating}⭐) - ${restaurant.address}`);
    });
    
  } catch (error) {
    console.error('Error adding Chinese restaurants:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
addChineseRestaurants();