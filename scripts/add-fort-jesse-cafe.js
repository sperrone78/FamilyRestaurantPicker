#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'family-restaurant-picker'
});

const db = admin.firestore();

// Fort Jesse Cafe restaurant data
const restaurant = {
  name: "Fort Jesse Cafe",
  address: "1531 Fort Jesse Road, Normal, IL 61761",
  phone: "(309) 451-5656",
  cuisineId: "1", // American
  priceRange: 2, // Moderate ($)
  rating: 4.4,
  website: "https://www.ftjessecafe.com",
  notes: "Women-owned breakfast and brunch cafe serving kicked-up versions of classics. Known for chicken and waffles, Cuban sandwich, and Fort Buster. Open 7 AM - 1 PM (Mon-Thu), 7 AM - 2 PM (Fri-Sun).",
  dietaryAccommodations: [
    { dietaryRestrictionId: "1", notes: "Some gluten-free options available" },
    { dietaryRestrictionId: "2", notes: "Vegetarian breakfast and brunch options" },
    { dietaryRestrictionId: "3", notes: "Vegan options available" }
  ],
  createdAt: new Date().toISOString()
};

async function addRestaurant() {
  try {
    console.log('🍴 Adding Fort Jesse Cafe to the restaurants collection...');
    
    const docRef = await db.collection('restaurants').add(restaurant);
    
    console.log('✅ Fort Jesse Cafe added successfully!');
    console.log(`📋 Restaurant ID: ${docRef.id}`);
    console.log(`📍 Address: ${restaurant.address}`);
    console.log(`☎️ Phone: ${restaurant.phone}`);
    console.log(`🌐 Website: ${restaurant.website}`);
    console.log(`⭐ Rating: ${restaurant.rating}/5`);
    console.log(`💰 Price Range: ${restaurant.priceRange}/4`);
    console.log(`🥗 Dietary Accommodations: ${restaurant.dietaryAccommodations.length} options`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding restaurant:', error);
    process.exit(1);
  }
}

addRestaurant();