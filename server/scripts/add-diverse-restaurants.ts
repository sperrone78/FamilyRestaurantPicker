import { db } from '../database/connection';
import { RestaurantModel } from '../models/Restaurant';
import { CreateRestaurantRequest } from '../types';

const diverseRestaurants: CreateRestaurantRequest[] = [
  // Indian Restaurants
  {
    name: "Signature India",
    address: "1407 North Veterans Parkway, Suite 26, Bloomington, IL 61704",
    phone: "(309) 664-0300",
    cuisineId: 6, // Indian
    priceRange: 2, // Moderate
    rating: 4.4,
    notes: "Family-owned restaurant offering authentic Indian foods with buffet and a la carte options. Known for biryani, chicken tikka masala, and goat curry.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Many naturally gluten-free dishes, rice-based options" },
      { dietaryRestrictionId: 2, notes: "Extensive vegetarian menu with traditional dal and vegetable dishes" },
      { dietaryRestrictionId: 3, notes: "Vegan options available with coconut milk curries" },
      { dietaryRestrictionId: 4, notes: "Dairy-free curries and rice dishes available" },
      { dietaryRestrictionId: 8, notes: "Halal meat options available" }
    ]
  },
  {
    name: "Aroma Indian Cuisine",
    address: "1320 E Empire St, Bloomington, IL 61704",
    phone: "(309) 662-7799",
    cuisineId: 6, // Indian
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Family-owned restaurant with high-quality authentic Indian foods. Offers both buffet and a la carte dining.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Rice dishes and many traditional curries are gluten-free" },
      { dietaryRestrictionId: 2, notes: "Traditional vegetarian Indian cuisine with lentil and vegetable dishes" },
      { dietaryRestrictionId: 3, notes: "Vegan curries and rice preparations available" },
      { dietaryRestrictionId: 8, notes: "Halal meat preparations" }
    ]
  },

  // Thai Restaurants
  {
    name: "Thai House",
    address: "414 N Main St, Bloomington, IL 61701",
    phone: "(309) 827-0100",
    cuisineId: 7, // Thai
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Elegant Thai restaurant with traditional interior. Known for curry, pad thai, and authentic Thai flavors.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Rice noodle dishes and rice-based meals available" },
      { dietaryRestrictionId: 2, notes: "Vegetarian curry and stir-fry options" },
      { dietaryRestrictionId: 3, notes: "Vegan curry with coconut milk and tofu dishes" },
      { dietaryRestrictionId: 4, notes: "Coconut milk-based curries are dairy-free" }
    ]
  },

  // Asian Fusion
  {
    name: "Wok to Bowl",
    address: "1209 E Empire St, Bloomington, IL 61704",
    phone: "(309) 828-3888",
    cuisineId: 5, // Japanese (closest for Asian fusion)
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Premier Asian restaurant featuring dishes from across Asia - Indian curries, Thai stir-fries, Chinese favorites, Korean specialties, and Japanese classics.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Rice dishes and sashimi options" },
      { dietaryRestrictionId: 2, notes: "Vegetable stir-fries and tofu dishes from multiple Asian cuisines" },
      { dietaryRestrictionId: 3, notes: "Vegan stir-fries and vegetable curries" }
    ]
  },

  // Korean
  {
    name: "Seoul Mama",
    address: "1511 E College Ave, Normal, IL 61761",
    phone: "(309) 454-8889",
    cuisineId: 12, // Korean
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Popular Korean restaurant known for authentic Korean cuisine including kimchi, bulgogi, and Korean BBQ.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Rice dishes and some Korean preparations are gluten-free" },
      { dietaryRestrictionId: 2, notes: "Vegetable-based Korean dishes and tofu preparations" },
      { dietaryRestrictionId: 3, notes: "Vegan kimchi and vegetable dishes available" }
    ]
  },

  // Middle Eastern/Mediterranean
  {
    name: "Jerusalem Restaurant",
    address: "1307 N Main St, Bloomington, IL 61701",
    phone: "(309) 827-5522",
    cuisineId: 8, // Mediterranean
    priceRange: 2, // Moderate
    rating: 4.5,
    notes: "Highly-rated Middle Eastern restaurant known for mixed shawarma, shish kabob, and authentic Mediterranean flavors.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Rice dishes and grilled meats without bread coating" },
      { dietaryRestrictionId: 2, notes: "Falafel, hummus, and vegetable-based Mediterranean dishes" },
      { dietaryRestrictionId: 3, notes: "Vegan hummus, falafel, and vegetable preparations" },
      { dietaryRestrictionId: 8, notes: "All meat is halal prepared" }
    ]
  },
  {
    name: "Ephesus Turkish & Mediterranean Cuisine",
    address: "1520 E Empire St, Bloomington, IL 61704",
    phone: "(309) 664-4400",
    cuisineId: 8, // Mediterranean
    priceRange: 2, // Moderate
    rating: 4.3,
    notes: "Authentic Turkish and Mediterranean restaurant with vintage-style setting. Known for kebabs, Turkish red lentil soup, and traditional dishes.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Rice dishes and grilled meat preparations" },
      { dietaryRestrictionId: 2, notes: "Stuffed falafel salad and vegetarian Turkish dishes" },
      { dietaryRestrictionId: 3, notes: "Vegan lentil soup and vegetable preparations" },
      { dietaryRestrictionId: 8, notes: "Halal meat preparations available" }
    ]
  },

  // Additional Authentic Mexican
  {
    name: "El Porton Mexican Restaurant",
    address: "1203 E Washington St, Bloomington, IL 61701",
    phone: "(309) 827-3073",
    cuisineId: 3, // Mexican
    priceRange: 1, // Budget-friendly
    rating: 4.4,
    notes: "Authentic Mexican restaurant serving real Mexican recipes from home. Known for excellent salsas and traditional flavors.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Corn tortillas and many traditional Mexican dishes are naturally gluten-free" },
      { dietaryRestrictionId: 2, notes: "Bean and cheese dishes, vegetarian options" },
      { dietaryRestrictionId: 3, notes: "Beans, rice, and vegetable-based dishes" }
    ]
  },
  {
    name: "La Mexicana Taqueria",
    address: "415 N Main St, Bloomington, IL 61701",
    phone: "(309) 828-6363",
    cuisineId: 3, // Mexican
    priceRange: 1, // Budget-friendly
    rating: 4.3,
    notes: "Authentic Mexican fast food trusted by Latino families. Built onto La Mexicana grocery store, serving traditional Mexican fare.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Corn tortillas and traditional preparations" },
      { dietaryRestrictionId: 2, notes: "Vegetarian tacos and bean dishes" },
      { dietaryRestrictionId: 3, notes: "Bean and vegetable-based Mexican dishes" }
    ]
  },
  {
    name: "Hacienda Leon",
    address: "407 North Hershey Road, Bloomington, IL 61704",
    phone: "(309) 664-1100",
    cuisineId: 3, // Mexican
    priceRange: 2, // Moderate
    rating: 4.2,
    notes: "Mexican restaurant opened in 2018 by Martin Leon, serving traditional Mexican food with emphasis on customer experience.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Corn tortilla-based dishes and traditional Mexican preparations" },
      { dietaryRestrictionId: 2, notes: "Vegetarian Mexican dishes with beans and cheese" },
      { dietaryRestrictionId: 3, notes: "Bean, rice, and vegetable dishes" }
    ]
  },

  // Chinese
  {
    name: "Golden Dragon Chinese Restaurant",
    address: "1213 S Main St, Normal, IL 61761",
    phone: "(309) 452-2888",
    cuisineId: 4, // Chinese
    priceRange: 2, // Moderate
    rating: 4.0,
    notes: "Traditional Chinese restaurant offering Cantonese and Szechuan dishes. Known for large portions and authentic flavors.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Steamed rice dishes and stir-fries without soy sauce" },
      { dietaryRestrictionId: 2, notes: "Vegetable stir-fries and tofu dishes" },
      { dietaryRestrictionId: 3, notes: "Vegan vegetable and tofu preparations" }
    ]
  },

  // Vietnamese
  {
    name: "Pho 911 Vietnamese Restaurant",
    address: "1617 N Veterans Pkwy, Bloomington, IL 61704",
    phone: "(309) 662-0911",
    cuisineId: 11, // Vietnamese
    priceRange: 1, // Budget-friendly
    rating: 4.2,
    notes: "Authentic Vietnamese restaurant specializing in pho, bánh mì, and traditional Vietnamese dishes.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 1, notes: "Rice noodle pho and rice dishes" },
      { dietaryRestrictionId: 2, notes: "Vegetarian pho and tofu dishes" },
      { dietaryRestrictionId: 3, notes: "Vegan pho broth and vegetable spring rolls" }
    ]
  },

  // African/Ethiopian
  {
    name: "Lalibela Ethiopian Restaurant",
    address: "502 N Main St, Bloomington, IL 61701",
    phone: "(309) 828-7373",
    cuisineId: 1, // American (closest available - would need Ethiopian cuisine type)
    priceRange: 2, // Moderate
    rating: 4.1,
    notes: "Authentic Ethiopian restaurant serving traditional injera bread with various stews and vegetarian combinations.",
    dietaryAccommodations: [
      { dietaryRestrictionId: 2, notes: "Traditional Ethiopian vegetarian combinations and lentil stews" },
      { dietaryRestrictionId: 3, notes: "Vegan Ethiopian stews and vegetable combinations" },
      { dietaryRestrictionId: 8, notes: "Halal meat preparations available" }
    ]
  }
];

async function addDiverseRestaurants() {
  try {
    console.log('Starting to add diverse restaurants to Bloomington-Normal database...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const restaurantData of diverseRestaurants) {
      try {
        // Check if restaurant already exists
        const existingQuery = 'SELECT id FROM restaurants WHERE name = $1';
        const existingResult = await db.query(existingQuery, [restaurantData.name]);
        
        if (existingResult.rows.length > 0) {
          console.log(`Skipping ${restaurantData.name} - already exists`);
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
    
    console.log(`\n🎉 Completed! Added ${addedCount} diverse restaurants, skipped ${skippedCount} existing restaurants.`);
    console.log('\n📊 Summary of cuisines added:');
    const cuisineCounts: Record<string, number> = {};
    for (const restaurant of diverseRestaurants) {
      const cuisineMap: Record<number, string> = {
        1: 'American/Ethiopian',
        3: 'Mexican',
        4: 'Chinese', 
        5: 'Japanese/Asian Fusion',
        6: 'Indian',
        7: 'Thai',
        8: 'Mediterranean/Middle Eastern',
        11: 'Vietnamese',
        12: 'Korean'
      };
      const cuisine = cuisineMap[restaurant.cuisineId || 0] || 'Unknown';
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
    }
    
    Object.entries(cuisineCounts).forEach(([cuisine, count]) => {
      console.log(`   ${cuisine}: ${count} restaurant${count > 1 ? 's' : ''}`);
    });
    
  } catch (error) {
    console.error('Error adding diverse restaurants:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
addDiverseRestaurants();