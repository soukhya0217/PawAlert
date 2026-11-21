import mongoose from "mongoose";
import path from "path";
import fs from "fs";

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

function cleanStaleLocks(dir: string) {
  const lockFiles = ["mongod.lock", "WiredTiger.lock"];
  for (const file of lockFiles) {
    const fullPath = path.join(dir, file);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`[MongoDB] Removed stale lockfile: ${file}`);
      } catch {
        // Ignored if actively locked
      }
    }
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // 5s timeout instead of hanging 30s
    };

    const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
    let uri: string | undefined = process.env.MONGODB_URI;

    // Check if URI is missing or has unreplaced template placeholders
    if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
      if (isVercel) {
        const msg = "Cloud MongoDB connection required on Vercel. Please add MONGODB_URI in your Vercel Project Settings > Environment Variables.";
        console.warn(`[MongoDB] ${msg}`);
        throw new Error(msg);
      }
      uri = "mongodb://127.0.0.1:27017/pawalert";
    }

    // On Vercel, localhost/127.0.0.1 will always be refused
    if (isVercel && (uri.includes("127.0.0.1") || uri.includes("localhost"))) {
      const msg = "Localhost MongoDB cannot run inside Vercel serverless containers. Please add your MongoDB Atlas cluster URI in Vercel Environment Variables.";
      console.warn(`[MongoDB] ${msg}`);
      throw new Error(msg);
    }

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log(`[MongoDB] Connected successfully to ${uri?.replace(/\/\/.*@/, "//***:***@")}`);
        return mongooseInstance;
      })
      .catch(async (err) => {
        console.warn(`[MongoDB] Connection to ${uri} failed (${err.message}).`);

        // If running on Vercel, in-memory server is not supported; throw clean informative error
        if (isVercel) {
          throw new Error(`Database connection failed: ${err.message}. Please verify your MONGODB_URI in Vercel settings.`);
        }

        // Local development fallback
        try {
          const { MongoMemoryServer } = await import("mongodb-memory-server");
          if (!cached.memoryServer) {
            const dataDir = path.resolve(process.cwd(), ".mongo-data");
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true });
            }
            cleanStaleLocks(dataDir);

            try {
              cached.memoryServer = await MongoMemoryServer.create({
                instance: {
                  dbPath: dataDir,
                  storageEngine: "wiredTiger",
                },
              });
            } catch (storageErr: any) {
              console.warn("[MongoDB] Persistent storage failed. Starting memory instance:", storageErr.message);
              cached.memoryServer = await MongoMemoryServer.create();
            }
          }
          const memUri = cached.memoryServer.getUri();
          console.log(`[MongoDB] Connected to local fallback instance at ${memUri}`);
          return await mongoose.connect(memUri, opts);
        } catch (memErr: any) {
          console.error("[MongoDB] Fallback initialization error:", memErr);
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
