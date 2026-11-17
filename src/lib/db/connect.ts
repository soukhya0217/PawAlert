import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer?: any;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  memoryServer: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    let uri: string = process.env.MONGODB_URI || "";

    // Fallback: If no URI provided, use MongoMemoryServer or local default
    if (!uri) {
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        if (!cached.memoryServer) {
          cached.memoryServer = await MongoMemoryServer.create();
        }
        uri = cached.memoryServer.getUri();
        console.log("Using in-memory MongoDB instance at:", uri);
      } catch (err) {
        console.warn("Could not start MongoMemoryServer, attempting local connection:", err);
        uri = "mongodb://127.0.0.1:27017/power_alert";
      }
    }

    const finalUri: string = uri || "mongodb://127.0.0.1:27017/power_alert";

    cached.promise = mongoose.connect(finalUri, opts).then((mongooseInstance) => {
      console.log("Connected to MongoDB successfully");
      return mongooseInstance;
    }).catch(async (err) => {
      console.error("Initial MongoDB connection error:", err.message);
      // Attempt fallback to in-memory if external cluster failed
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        cached.memoryServer = await MongoMemoryServer.create();
        const memUri: string = cached.memoryServer.getUri();
        console.log("Fell back to in-memory MongoDB instance at:", memUri);
        return await mongoose.connect(memUri, opts);
      } catch (memErr) {
        throw err;
      }
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
