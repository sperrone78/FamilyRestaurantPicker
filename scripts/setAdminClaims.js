/**
 * Script to manually set admin claims for the designated admin user
 * Run this script once to set up admin privileges
 * 
 * Usage: node scripts/setAdminClaims.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require(path.join(__dirname, '..', 'firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

async function setAdminClaims() {
  const adminEmail = 'sperrone78@gmail.com';
  
  try {
    console.log(`Setting admin claims for ${adminEmail}...`);
    
    // Get user by email
    const user = await admin.auth().getUserByEmail(adminEmail);
    console.log(`Found user: ${user.uid}`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: 'admin'
    });
    
    console.log(`✅ Admin claims set successfully for ${adminEmail}`);
    console.log('The user will need to sign out and sign back in for the changes to take effect.');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User with email ${adminEmail} not found. Please make sure the user has signed up first.`);
    } else {
      console.error('❌ Error setting admin claims:', error.message);
    }
  }
  
  process.exit(0);
}

setAdminClaims();