import { db } from '../database/connection';
import { RestaurantModel } from '../models/Restaurant';
import { CreateRestaurantRequest } from '../types';

// Add Taco John's
const correctMexicanRestaurant: CreateRestaurantRequest = {
  name: "Taco John's",
  address: "1525 S Main St, Bloomington, IL 61701",
  phone: "(309) 828-4336",
  cuisineId: 3, // Mexican
  priceRange: 1, // Budget-friendly
  rating: 3.8,
  website: "https://www.tacojohns.com",
  notes: "Fast-food Mexican chain known for Potato Olés, tacos, burritos, and breakfast items. Serves original tacos and nachos.",
  dietaryAccommodations: [
    { dietaryRestrictionId: 1, notes: "Some items can be made gluten-free, check with staff" },
    { dietaryRestrictionId: 2, notes: "Vegetarian options including bean burritos and cheese items" }
  ]
};

async function fixMexicanRestaurants() {
  try {
    console.log('🌮 Adding missing Taco John\'s to Mexican restaurants...');
    
    // Check if Taco John's already exists
    const existingQuery = 'SELECT id FROM restaurants WHERE LOWER(name) = LOWER($1)';
    const existingResult = await db.query(existingQuery, [correctMexicanRestaurant.name]);
    
    if (existingResult.rows.length > 0) {
      console.log(`⏭️  Skipping ${correctMexicanRestaurant.name} - already exists`);
      return;
    }
    
    // Add Taco John's
    console.log(`Creating ${correctMexicanRestaurant.name}...`);
    const restaurant = await RestaurantModel.create(correctMexicanRestaurant);
    
    if (restaurant) {
      console.log(`✅ Added: ${restaurant.name} (ID: ${restaurant.id}) - ${restaurant.cuisine?.name} cuisine`);
    } else {
      console.error(`❌ Failed to create ${correctMexicanRestaurant.name} - restaurant was null`);
    }
    
    // Get final Mexican restaurant count and list
    const mexicanCountResult = await db.query(`
      SELECT COUNT(*) as mexican_count 
      FROM restaurants r 
      JOIN cuisines c ON r.cuisine_id = c.id 
      WHERE c.name = 'Mexican'
    `);
    const mexicanCount = mexicanCountResult.rows[0].mexican_count;
    
    console.log(`\n🎉 Mexican Restaurant Update Complete!`);
    console.log(`   ❌ Previously removed: Qdoba Mexican Eats (closed)`);
    console.log(`   ✅ Added: Taco John's`);
    console.log(`   🌮 Total Mexican restaurants: ${mexicanCount}`);
    
    console.log('\n🌮 Current Mexican restaurants in Bloomington-Normal:');
    const mexicanListResult = await db.query(`
      SELECT r.name, r.address 
      FROM restaurants r 
      JOIN cuisines c ON r.cuisine_id = c.id 
      WHERE c.name = 'Mexican'
      ORDER BY r.name
    `);
    
    mexicanListResult.rows.forEach(restaurant => {
      console.log(`   🌮 ${restaurant.name} - ${restaurant.address}`);
    });
    
  } catch (error) {
    console.error('Error fixing Mexican restaurants:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
fixMexicanRestaurants();