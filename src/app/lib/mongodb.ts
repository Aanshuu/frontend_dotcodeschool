import { MongoClient } from "mongodb";

// Check for the MongoDB URI
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

// Global variable to cache the MongoDB connection
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development mode, use a global variable so that the connection
// is reused across hot-reloads
if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement)
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client for each connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;