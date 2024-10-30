import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';

dotenv.config();

// Path to your service account key
const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  databaseURL: "https://smoothie-test-53729-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smoothie-test-53729",
});

// Initialize Firestore
const db = admin.firestore();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://smoothie-test-53729.web.app',
  'http://localhost'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}.`;
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Existing Middlewares: COOP and CSP
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://images.unsplash.com; font-src 'self';"
  );
  next();
});

// Authentication Middleware using Firebase Admin
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.sendStatus(403); // Forbidden
  }
};

// Example data for orders
const orders = [
  { id: 1, item: 'Smoothie', quantity: 2 },
  { id: 2, item: 'Juice', quantity: 1 },
  // Add more orders as needed
];

// Example unprotected route for orders
app.get('/orders', (req, res) => {
  res.json(orders);
});

// Route to fetch user data without authentication
app.get('/users/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    // Attempt to fetch the user from Firebase Authentication
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
      console.log(`Fetched user record for UID: ${uid}`);
    } catch (authError) {
      console.error(`Error fetching user from Auth for UID ${uid}:`, authError);
      return res.status(404).json({ message: 'User not found in authentication system.' });
    }

    // Attempt to fetch the user document from Firestore
    let userDoc;
    try {
      userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        console.warn(`User document not found in Firestore for UID: ${uid}`);
        return res.status(404).json({ message: 'User data not found in Firestore.' });
      }
      console.log(`Fetched user document from Firestore for UID: ${uid}`);
    } catch (firestoreError) {
      console.error(`Error fetching user document from Firestore for UID ${uid}:`, firestoreError);
      return res.status(500).json({ message: 'Error accessing user data in Firestore.' });
    }

    const userData = userDoc.data();

    res.json({
      uid: userRecord.uid,
      name: userRecord.displayName || '',
      email: userRecord.email || '',
      phone: userRecord.phoneNumber || '',
      address: userData?.address || '',
      role: userData?.role || 'user', // Ensure role is included
    });
  } catch (error) {
    console.error('Unexpected error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to update user data
app.put('/users/:uid', authenticateToken, async (req, res) => {
  const { uid } = req.params;
  const { name, phone, address } = req.body;

  // Authorization check
  if (req.user.uid !== uid && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
  }

  try {
    // Validate phone number format
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone number format. It should be in E.164 format (e.g., +1234567890).');
    }

    // Validate name
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required.');
    }

    // Update Firebase user profile
    await admin.auth().updateUser(uid, {
      displayName: name,
      phoneNumber: phone,
    });

    // Update address in Firestore
    await db.collection('users').doc(uid).update({ address });

    res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error.message);
    res.status(400).json({ message: 'Failed to update user data', error: error.message });
  }
});

// Add a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Test route to verify Firebase Authentication
app.get('/test-auth/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const userRecord = await admin.auth().getUser(uid);
    res.json({
      uid: userRecord.uid,
      name: userRecord.displayName || '',
      email: userRecord.email || '',
    });
  } catch (error) {
    console.error(`Error fetching user for UID ${uid}:`, error);
    res.status(500).json({ message: 'Error fetching user from Auth.' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Example of returning JSON for errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

