#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'family-restaurant-picker'
});

const db = admin.firestore();

async function fixRestaurantFamilyIds() {
  try {
    console.log('🔍 Finding restaurants with demo familyId...');
    
    // Get all restaurants with familyId: 'demo'
    const restaurantsSnapshot = await db.collection('restaurants')
      .where('familyId', '==', 'demo')
      .get();
    
    if (restaurantsSnapshot.empty) {
      console.log('❌ No restaurants found with familyId: "demo"');
      console.log('Let me check all restaurants...');
      
      const allRestaurants = await db.collection('restaurants').get();
      console.log(`📊 Found ${allRestaurants.size} total restaurants`);
      
      if (!allRestaurants.empty) {
        console.log('🏪 Existing restaurants:');
        allRestaurants.forEach(doc => {
          const data = doc.data();
          console.log(`  - ${data.name} (familyId: ${data.familyId})`);
        });
      }
      return;
    }
    
    console.log(`✅ Found ${restaurantsSnapshot.size} restaurants to update`);
    
    // Ask user for their Firebase user ID
    console.log('\n📝 To fix this, we need your Firebase user ID.');
    console.log('You can find this by:');
    console.log('1. Opening your browser console on the app');
    console.log('2. Going to the Family Members page');
    console.log('3. Looking for any console.log that shows user.uid');
    console.log('4. Or checking Firebase Auth console');
    console.log('\n⚠️  For now, I\'ll create restaurants for a generic user ID.');
    console.log('   You can run this script again with your actual user ID later.\n');
    
    // Use a placeholder user ID that you can replace
    const newFamilyId = process.argv[2] || 'YOUR_USER_ID_HERE';
    
    const batch = db.batch();
    let updateCount = 0;
    
    restaurantsSnapshot.forEach(doc => {
      batch.update(doc.ref, { familyId: newFamilyId });
      updateCount++;
    });
    
    await batch.commit();
    console.log(`🎉 Updated ${updateCount} restaurants to use familyId: "${newFamilyId}"`);
    
    if (newFamilyId === 'YOUR_USER_ID_HERE') {
      console.log('\n🔧 To fix this properly:');
      console.log('1. Find your actual Firebase user ID');
      console.log('2. Run: node scripts/fix-restaurant-familyids.js YOUR_ACTUAL_USER_ID');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

fixRestaurantFamilyIds();