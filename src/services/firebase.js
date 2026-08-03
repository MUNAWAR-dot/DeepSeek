// Firebase is disabled - using Render backend instead
const firebase = {
  apps: [],
  initializeApp: () => {},
};

const auth = {
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.reject('Firebase not available - use Render API'),
  createUserWithEmailAndPassword: () => Promise.reject('Firebase not available - use Render API'),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: () => {},
};

const firestore = {
  collection: () => ({
    add: () => Promise.reject('Firebase not available - use Render API'),
    doc: () => ({
      get: () => Promise.reject('Firebase not available - use Render API'),
      set: () => Promise.reject('Firebase not available - use Render API'),
      update: () => Promise.reject('Firebase not available - use Render API'),
      delete: () => Promise.reject('Firebase not available - use Render API'),
    }),
    where: () => ({
      get: () => Promise.reject('Firebase not available - use Render API'),
    }),
  }),
};

const storage = {
  ref: () => ({
    putFile: () => Promise.reject('Firebase not available - use Cloudinary'),
    getDownloadURL: () => Promise.reject('Firebase not available - use Cloudinary'),
  }),
};

const analytics = () => ({});
const crashlytics = () => ({});
const messaging = () => ({});

export { firebase, auth, firestore, storage, analytics, crashlytics, messaging };
export default firebase;
