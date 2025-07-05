import { db } from '../database/connection';
import { RestaurantModel } from '../models/Restaurant';
import { CreateRestaurantRequest } from '../types';

// Remove incorrect BBQ restaurants
const restaurantsToRemove = ['Blackstone Smokehouse', 'Famous Dave\'s Bar-B-Que'];

// Add correct BBQ restaurants
const correctBBQRestaurants: CreateRestaurantRequest[] = [
  {
    name: "Brass Pig Smoke & Alehouse",
    address: "602 N Main St, Bloomington, IL 61701",
    phone: "(309) 828-2447", // Found through additional research
    cuisineId: 13, // BBQ
    priceRange: 2, // Moderate
    rating: 4.3,
    website: "https://www.brasspigsmokehouse.com",
    notes: "Downtown BBQ smokehouse and alehouse operating since 2019. Daily smoked meats using locally sourced ingredients. Full liquor bar with bourbon and craft cocktails.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Some gluten-free BBQ options available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian appetizers and sides" }
    ]
  },
  {
    name: "Annie's Eats Carry-Out and Catering",
    address: "606 N Clinton Street, Bloomington, IL 61701",
    phone: "(309) 665-0033",
    cuisineId: 13, // BBQ
    priceRange: 2, // Moderate
    rating: 4.5,
    website: "https://annieseatsblono.com",
    notes: "Award-winning BBQ carry-out and catering. Fresh smoked BBQ and handmade sides. Over 10 years of pitmaster experience, opened 2018. Carry-out only, no dine-in.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Some gluten-free BBQ and sides available" }
    ]
  }
];

async function fixBBQRestaurants() {
  try {
    console.log('🔧 Fixing BBQ restaurant listings in Bloomington-Normal...');
    
    let removedCount = 0;
    let addedCount = 0;
    let skippedCount = 0;
    
    // Remove incorrect BBQ restaurants
    console.log('\n🗑️  Removing incorrect BBQ restaurants:');
    for (const restaurantName of restaurantsToRemove) {
      try {
        const deleteQuery = 'DELETE FROM restaurants WHERE name = $1 RETURNING id, name';
        const result = await db.query(deleteQuery, [restaurantName]);
        
        if (result.rows.length > 0) {
          console.log(`❌ Removed: ${restaurantName} (ID: ${result.rows[0].id}) - incorrect/closed restaurant`);
          removedCount++;
        } else {
          console.log(`⚠️  ${restaurantName} not found for removal`);
        }
      } catch (error) {
        console.error(`❌ Failed to remove ${restaurantName}:`, error);
      }
    }
    
    // Update Annie's Eats if it exists with wrong cuisine
    console.log('\n🔄 Checking if Annie\'s Eats needs cuisine update...');
    try {
      const updateQuery = `
        UPDATE restaurants 
        SET cuisine_id = $1, notes = $2, website = $3, phone = $4
        WHERE name = $5
        RETURNING id, name
      `;
      const updateResult = await db.query(updateQuery, [
        13, // BBQ cuisine
        "Award-winning BBQ carry-out and catering. Fresh smoked BBQ and handmade sides. Over 10 years of pitmaster experience, opened 2018. Carry-out only, no dine-in.",
        "https://annieseatsblono.com",
        "(309) 665-0033",
        "Annie's Eats"
      ]);
      
      if (updateResult.rows.length > 0) {
        console.log(`🔄 Updated: Annie's Eats - corrected to BBQ cuisine with proper details`);
      }
    } catch (error) {
      console.error('Error updating Annie\'s Eats:', error);
    }
    
    // Add correct BBQ restaurants
    console.log('\n➕ Adding correct BBQ restaurants:');
    for (const restaurantData of correctBBQRestaurants) {
      try {
        // Skip Annie's Eats since we updated it above
        if (restaurantData.name === "Annie's Eats Carry-Out and Catering") {
          console.log(`⏭️  Skipping ${restaurantData.name} - already updated above`);
          skippedCount++;
          continue;
        }
        
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
    
    // Get final BBQ restaurant count
    const bbqCountResult = await db.query(`
      SELECT COUNT(*) as bbq_count 
      FROM restaurants r 
      JOIN cuisines c ON r.cuisine_id = c.id 
      WHERE c.name = 'BBQ'
    `);
    const bbqCount = bbqCountResult.rows[0].bbq_count;
    
    console.log(`\n🎉 BBQ Restaurant Fix Complete!`);
    console.log(`   ❌ Removed: ${removedCount} incorrect restaurants`);
    console.log(`   ✅ Added: ${addedCount} correct restaurants`);
    console.log(`   🔄 Updated: 1 existing restaurant (Annie's Eats)`);
    console.log(`   ⏭️  Skipped: ${skippedCount} existing restaurants`);
    console.log(`   🍖 Total BBQ restaurants: ${bbqCount}`);
    
    console.log('\n🔥 Correct BBQ restaurants in Bloomington-Normal:');
    const bbqListResult = await db.query(`
      SELECT r.name, r.address 
      FROM restaurants r 
      JOIN cuisines c ON r.cuisine_id = c.id 
      WHERE c.name = 'BBQ'
      ORDER BY r.name
    `);
    
    bbqListResult.rows.forEach(restaurant => {
      console.log(`   🍖 ${restaurant.name} - ${restaurant.address}`);
    });
    
  } catch (error) {
    console.error('Error fixing BBQ restaurants:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
fixBBQRestaurants();