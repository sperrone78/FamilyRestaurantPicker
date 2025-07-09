#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'family-restaurant-picker'
});

const db = admin.firestore();

async function findRestaurantsGlobally() {
  try {
    console.log('🔍 Searching for Theo\'s and Ivy Lane restaurants globally...');
    
    // Search for Theo's Microcreamery
    const theosQuery = await db.collection('restaurants')
      .where('name', '>=', 'Theo')
      .where('name', '<=', 'Theo\uf8ff')
      .get();
    
    // Search for Ivy Lane Bakery
    const ivyQuery = await db.collection('restaurants')
      .where('name', '>=', 'Ivy')
      .where('name', '<=', 'Ivy\uf8ff')
      .get();
    
    console.log(`📊 Found ${theosQuery.size} restaurants starting with "Theo"`);
    console.log(`📊 Found ${ivyQuery.size} restaurants starting with "Ivy"`);
    
    if (theosQuery.size > 0) {
      console.log('\n🍦 Theo\'s restaurants found:');
      theosQuery.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name} (Family: ${data.familyId}, Cuisine: ${data.cuisineId})`);
      });
    }
    
    if (ivyQuery.size > 0) {
      console.log('\n🥖 Ivy restaurants found:');
      ivyQuery.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name} (Family: ${data.familyId}, Cuisine: ${data.cuisineId})`);
      });
    }
    
    // Also let's check what family IDs exist
    console.log('\n👨‍👩‍👧‍👦 Checking existing family IDs...');
    const familyMembersQuery = await db.collection('familyMembers').get();
    const familyIds = new Set();
    
    familyMembersQuery.forEach(doc => {
      const data = doc.data();
      if (data.familyId) {
        familyIds.add(data.familyId);
      }
    });
    
    console.log(`📊 Found ${familyIds.size} unique family IDs:`);
    Array.from(familyIds).forEach(id => {
      console.log(`   - ${id}`);
    });
    
    // Check restaurants for each family ID
    for (const familyId of familyIds) {
      const restaurantsQuery = await db.collection('restaurants')
        .where('familyId', '==', familyId)
        .get();
      
      console.log(`\n🏪 Family ${familyId} has ${restaurantsQuery.size} restaurants`);
      if (restaurantsQuery.size > 0 && restaurantsQuery.size <= 5) {
        restaurantsQuery.forEach(doc => {
          const data = doc.data();
          console.log(`   - ${data.name}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

findRestaurantsGlobally();