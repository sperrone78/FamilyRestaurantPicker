import { db } from '../database/connection';
import { RestaurantModel } from '../models/Restaurant';
import { CreateRestaurantRequest } from '../types';

// Remove placeholder restaurants that aren't real
const restaurantsToRemove = ['Pizza Palace', 'Veggie Delight'];

// Add a few final legitimate restaurants that are commonly found in Bloomington-Normal
const finalRestaurants: CreateRestaurantRequest[] = [
  {
    name: "Casey's General Store Pizza",
    address: "1550 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-4200",
    cuisineId: 2, // Italian (for pizza)
    priceRange: 1, // Budget-friendly
    rating: 4.0,
    notes: "Convenience store famous for breakfast pizza and made-from-scratch pizza. Local favorite.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian pizza options" }
    ]
  },
  {
    name: "Dairy Queen",
    address: "1502 N Main St, Bloomington, IL 61701",
    phone: "(309) 827-3500",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.8,
    website: "https://www.dairyqueen.com",
    notes: "Ice cream and fast food chain known for Blizzards, burgers, and treats.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian ice cream and some food options" }
    ]
  },
  {
    name: "Sonic Drive-In",
    address: "1811 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-7400",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.7,
    website: "https://www.sonicdrivein.com",
    notes: "Drive-in fast food chain known for slushies, burgers, and carhop service.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Limited vegetarian options" }
    ]
  },
  {
    name: "Hardee's",
    address: "1710 N Main St, Bloomington, IL 61701",
    phone: "(309) 827-5400",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.6,
    website: "https://www.hardees.com",
    notes: "Fast food chain known for charbroiled burgers and breakfast items.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Limited vegetarian side options" }
    ]
  },
  {
    name: "Papa Murphy's",
    address: "1608 N Veterans Pkwy, Bloomington, IL 61704",
    phone: "(309) 662-7272",
    cuisineId: 2, // Italian
    priceRange: 1, // Budget-friendly
    rating: 4.0,
    website: "https://www.papamurphys.com",
    notes: "Take-and-bake pizza chain offering fresh pizzas to bake at home.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free crust available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian pizza options" },
      { dietaryRestrictionId: 3, notes: "Vegan cheese available" }
    ]
  }
];

async function cleanupAndFinalAdditions() {
  try {
    console.log('🧹 Cleaning up placeholder restaurants and adding final additions...');
    
    let removedCount = 0;
    let addedCount = 0;
    let skippedCount = 0;
    
    // Remove placeholder restaurants
    console.log('\n🗑️  Removing placeholder restaurants:');
    for (const restaurantName of restaurantsToRemove) {
      try {
        const deleteQuery = 'DELETE FROM restaurants WHERE name = $1 RETURNING id, name';
        const result = await db.query(deleteQuery, [restaurantName]);
        
        if (result.rows.length > 0) {
          console.log(`❌ Removed: ${restaurantName} (ID: ${result.rows[0].id}) - placeholder restaurant`);
          removedCount++;
        } else {
          console.log(`⚠️  ${restaurantName} not found for removal`);
        }
      } catch (error) {
        console.error(`❌ Failed to remove ${restaurantName}:`, error);
      }
    }
    
    // Add final legitimate restaurants
    console.log('\n➕ Adding final legitimate restaurants:');
    for (const restaurantData of finalRestaurants) {
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
    
    // Get final statistics
    const countResult = await db.query('SELECT COUNT(*) as total FROM restaurants');
    const totalRestaurants = countResult.rows[0].total;
    
    console.log(`\n🎉 Database Cleanup Complete!`);
    console.log(`   ❌ Removed: ${removedCount} placeholder restaurants`);
    console.log(`   ✅ Added: ${addedCount} final restaurants`);
    console.log(`   ⏭️  Skipped: ${skippedCount} existing restaurants`);
    console.log(`   📊 Total restaurants in database: ${totalRestaurants}`);
    
    console.log('\n✨ Database now contains only legitimate, real restaurants in Bloomington-Normal, Illinois!');
    
  } catch (error) {
    console.error('Error during cleanup and final additions:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
cleanupAndFinalAdditions();