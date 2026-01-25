import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};  // ← REMOVED deprecated options

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// ✅ ADD THIS FUNCTION - Used by API routes
export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db("kalakruthi"); // Your database name
  return { db, client };
}

export default clientPromise;
