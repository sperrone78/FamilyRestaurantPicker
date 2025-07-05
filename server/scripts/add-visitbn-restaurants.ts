import { db } from '../database/connection';
import { RestaurantModel } from '../models/Restaurant';
import { CreateRestaurantRequest } from '../types';

const visitBNRestaurants: CreateRestaurantRequest[] = [
  {
    name: "Alexander's Steakhouse",
    address: "1503 East College Avenue, Normal, IL 61761",
    phone: "(309) 454-7300",
    cuisineId: 15, // Steakhouse
    priceRange: 3, // Upscale
    rating: 4.5,
    notes: "Fine dining steakhouse known for premium steaks and upscale atmosphere. Professional service and quality beef.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free preparations available" }
    ]
  },
  {
    name: "Ancho & Agave",
    address: "3006 East Empire Street, Bloomington, IL 61704",
    phone: "(309) 590-3200",
    cuisineId: 3, // Mexican
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Mexican restaurant and tequila bar offering authentic Mexican cuisine with modern twist. Extensive tequila and mezcal selection.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Corn tortillas and many traditional dishes are gluten-free" },
      { dietaryRestrictionId: 2, notes: "Vegetarian Mexican dishes available" },
      { dietaryRestrictionId: 3, notes: "Vegan options with beans and vegetables" }
    ]
  },
  {
    name: "Anju Above",
    address: "220 East Front Street, Bloomington, IL 61701",
    phone: "(309) 828-8704",
    cuisineId: 12, // Korean
    priceRange: 2, // Moderate
    rating: 4.4,
    notes: "Korean restaurant located upstairs in downtown Normal. Specializes in authentic Korean dishes with modern presentation.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Rice dishes and some Korean preparations are gluten-free" },
      { dietaryRestrictionId: 2, notes: "Vegetable-based Korean dishes and tofu options" },
      { dietaryRestrictionId: 3, notes: "Vegan Korean vegetable dishes" }
    ]
  },
  {
    name: "A&P Tap",
    address: "721 West Chestnut Street, Bloomington, IL 61701",
    phone: "(309) 828-5581",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Gastropub-style restaurant combining American cuisine with craft beer selection. Casual atmosphere with diverse menu.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free options available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian menu selections" }
    ]
  },
  {
    name: "Annie's Eats",
    address: "606 N Clinton St., Bloomington, IL 61701",
    phone: "(309) 824-0803",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 4.0,
    notes: "Local casual dining spot known for comfort food and friendly atmosphere.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian options available" }
    ]
  },
  {
    name: "Bakery and Pickle",
    address: "513 N. Main St., Bloomington, IL 61701",
    phone: "(309) 533-1500",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Bakery and cafe offering fresh baked goods, sandwiches, and light meals.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Some gluten-free baked goods available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian sandwich and salad options" },
      { dietaryRestrictionId: 3, notes: "Vegan baked goods and menu items" }
    ]
  },
  {
    name: "Bandana's Bar-B-Q",
    address: "502 IAA Drive, Bloomington, IL 61701",
    phone: "(309) 662-7427",
    cuisineId: 13, // BBQ
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "BBQ restaurant chain known for ribs, pulled pork, and traditional barbecue sides.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Some gluten-free BBQ options" }
    ]
  },
  {
    name: "Analytical Brewing",
    address: "510 W Main St., Lexington, IL 61753",
    phone: "(309) 490-1029",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Craft brewery with food menu. Known for analytical approach to brewing and quality beer selections.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free beer options available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian pub food options" }
    ]
  },
  {
    name: "Biaggis Ristorante Italiano",
    address: "3302 East Empire Street, Bloomington, IL 61704",
    phone: "(309) 662-9922",
    cuisineId: 2, // Italian
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Updated location information for Biaggi's. Upscale Italian chain with contemporary cuisine and extensive wine list.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Dedicated gluten-free menu" },
      { dietaryRestrictionId: 2, notes: "Vegetarian pasta and pizza options" },
      { dietaryRestrictionId: 3, notes: "Vegan cheese and plant-based options" }
    ]
  },
  {
    name: "Big Apple Bagels",
    address: "1203 S Main St, Normal, IL 61761",
    phone: "(309) 452-2245",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.8,
    notes: "Bagel shop and cafe offering fresh bagels, sandwiches, and coffee.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian bagel and sandwich options" }
    ]
  },
  {
    name: "Blackstone Smokehouse",
    address: "1312 E Empire St, Bloomington, IL 61704",
    phone: "(309) 808-0700",
    cuisineId: 13, // BBQ
    priceRange: 2, // Moderate
    rating: 4.4,
    notes: "Local BBQ smokehouse known for authentic smoked meats and sides.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Some gluten-free BBQ options available" }
    ]
  },
  {
    name: "Blaze Pizza",
    address: "1711 N Veterans Pkwy, Bloomington, IL 61704",
    phone: "(309) 808-9200",
    cuisineId: 2, // Italian
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Fast-casual pizza chain with made-to-order artisanal pizzas and fresh ingredients.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free crust available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian pizza options" },
      { dietaryRestrictionId: 3, notes: "Vegan cheese and plant-based toppings" }
    ]
  },
  {
    name: "Bloomin' Barrel Restaurant",
    address: "1415 W Market St, Bloomington, IL 61701",
    phone: "(309) 827-7374",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Local family restaurant known for comfort food and home-style cooking.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Vegetarian options available" }
    ]
  },
  {
    name: "Culver's",
    address: "1710 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-3200",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 4.2,
    notes: "Fast-casual chain known for ButterBurgers, Wisconsin cheese curds, and frozen custard.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Some gluten-free options available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian burger and side options" }
    ]
  },
  {
    name: "Firehouse Subs",
    address: "1607 N Veterans Pkwy, Bloomington, IL 61704",
    phone: "(309) 808-0500",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Sandwich chain with firefighter theme, known for hot submarine sandwiches.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free bread available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian sandwich options" }
    ]
  },
  {
    name: "Five Guys",
    address: "1825 E Empire St, Bloomington, IL 61704",
    phone: "(309) 808-0400",
    cuisineId: 1, // American
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Burger chain known for hand-cut fries and customizable burgers with fresh ingredients.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Bunless burger options available" },
      { dietaryRestrictionId: 2, notes: "Veggie sandwich options" }
    ]
  },
  {
    name: "Jimmy John's",
    address: "1320 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-5200",
    cuisineId: 1, // American
    priceRange: 1, // Budget-friendly
    rating: 3.9,
    notes: "Fast sandwich delivery chain known for 'freaky fast' service and gourmet sandwiches.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Lettuce wraps available instead of bread" },
      { dietaryRestrictionId: 2, notes: "Vegetarian sandwich options" }
    ]
  },
  {
    name: "La Bamba Mexican Restaurant",
    address: "1109 S Main St, Normal, IL 61761",
    phone: "(309) 452-1700",
    cuisineId: 3, // Mexican
    priceRange: 1, // Budget-friendly
    rating: 4.0,
    notes: "Local Mexican restaurant chain known for burritos, tacos, and quick service.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Corn tortillas and many items are gluten-free" },
      { dietaryRestrictionId: 2, notes: "Vegetarian bean and cheese options" },
      { dietaryRestrictionId: 3, notes: "Vegan bean and vegetable options" }
    ]
  },
  {
    name: "Moe's Southwest Grill",
    address: "1707 N Veterans Pkwy, Bloomington, IL 61704",
    phone: "(309) 662-6637",
    cuisineId: 3, // Mexican
    priceRange: 2, // Moderate
    rating: 3.9,
    notes: "Fast-casual Tex-Mex chain known for burritos, bowls, and free chips with queso.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Many items gluten-free, corn tortillas available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian protein options" },
      { dietaryRestrictionId: 3, notes: "Vegan bowl options" }
    ]
  },
  {
    name: "Rosati's Pizza",
    address: "1902 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-7600",
    cuisineId: 2, // Italian
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Chicago-style pizza chain known for deep dish and thin crust pizzas.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Gluten-free crust available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian pizza options" }
    ]
  }
];

async function addVisitBNRestaurants() {
  try {
    console.log('🌐 Adding missing restaurants from Visit BN official website...');
    
    let addedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    
    for (const restaurantData of visitBNRestaurants) {
      try {
        // Check if restaurant already exists (exact name match)
        const existingQuery = 'SELECT id, name FROM restaurants WHERE LOWER(name) = LOWER($1)';
        const existingResult = await db.query(existingQuery, [restaurantData.name]);
        
        if (existingResult.rows.length > 0) {
          // Check if this is Biaggi's with address update
          if (restaurantData.name === "Biaggis Ristorante Italiano") {
            const updateQuery = `
              UPDATE restaurants 
              SET address = $1, notes = $2 
              WHERE LOWER(name) = LOWER($3)
              RETURNING id, name
            `;
            const updateResult = await db.query(updateQuery, [
              restaurantData.address,
              restaurantData.notes,
              "Biaggi's Ristorante Italiano"
            ]);
            
            if (updateResult.rows.length > 0) {
              console.log(`🔄 Updated: ${restaurantData.name} - address and details`);
              updatedCount++;
            }
          } else {
            console.log(`⏭️  Skipping ${restaurantData.name} - already exists`);
            skippedCount++;
          }
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
    
    console.log(`\n🎉 Visit BN Update Complete!`);
    console.log(`   ✅ Added: ${addedCount} new restaurants`);
    console.log(`   🔄 Updated: ${updatedCount} existing restaurants`);
    console.log(`   ⏭️  Skipped: ${skippedCount} existing restaurants`);
    
    console.log('\n📍 Key additions from official Visit BN website:');
    console.log('   🥩 Alexander\'s Steakhouse - Upscale steakhouse');
    console.log('   🌮 Ancho & Agave - Mexican tequila bar');
    console.log('   🇰🇷 Anju Above - Korean restaurant');
    console.log('   🍺 A&P Tap - Gastropub with craft beer');
    console.log('   🍕 Blaze Pizza - Fast-casual artisanal pizza');
    console.log('   🔥 Blackstone Smokehouse - Local BBQ');
    console.log('   🍔 Culver\'s - ButterBurgers and custard');
    
  } catch (error) {
    console.error('Error updating restaurants from Visit BN:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
addVisitBNRestaurants();