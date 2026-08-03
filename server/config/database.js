const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (admin.apps.length === 0) {
      const serviceAccount = require('./firebase-service-account.json');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });

      console.log('Firebase Admin initialized successfully');
    }

    return admin;
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    process.exit(1);
  }
};

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const messaging = admin.messaging();

// Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true,
});

module.exports = {
  admin,
  db,
  auth,
  storage,
  messaging,
  initializeFirebase,
};
