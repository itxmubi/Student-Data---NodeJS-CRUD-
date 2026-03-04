const admin = require('firebase-admin')
const fs = require('fs');
const path = require('path');

let firebaseInitialized = false;

try {
    const serviceAccountPath = path.join(__dirname, '../firebaseServiceAccount.json');
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        firebaseInitialized = true;
    } else {
        console.warn('⚠️  firebaseServiceAccount.json not found. Firebase notifications will be disabled.');
    }
} catch (error) {
    console.warn('⚠️  Failed to initialize Firebase:', error.message);
}

module.exports = { admin, firebaseInitialized };