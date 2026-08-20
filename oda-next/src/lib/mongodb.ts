import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Safely format and normalize MongoDB connection string
 * Automatically encodes special characters in username/password if needed
 */
export function normalizeMongoUri(uri: string): string {
  if (!uri) return "";

  try {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.*?)(@.*)$/);
    if (!match) return uri;

    const protocol = match[1];
    const userPass = match[2];
    const hostAndRest = match[3];

    const colonIndex = userPass.indexOf(":");
    if (colonIndex === -1) return uri;

    const rawUser = userPass.substring(0, colonIndex);
    const rawPass = userPass.substring(colonIndex + 1);

    // If user or pass already contains % (partially encoded), avoid double encoding
    const safeUser = encodeURIComponent(decodeURIComponent(rawUser));
    const safePass = encodeURIComponent(decodeURIComponent(rawPass));

    return `${protocol}${safeUser}:${safePass}${hostAndRest}`;
  } catch {
    return uri;
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const sanitizedUri = normalizeMongoUri(rawUri);

    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(sanitizedUri, opts)
      .then((m) => {
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
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

export default connectToDatabase;
