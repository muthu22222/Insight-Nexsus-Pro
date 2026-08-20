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
    let clean = uri.trim();
    // Strip surrounding quotes if present
    if (
      (clean.startsWith('"') && clean.endsWith('"')) ||
      (clean.startsWith("'") && clean.endsWith("'"))
    ) {
      clean = clean.slice(1, -1).trim();
    }

    const match = clean.match(/^(mongodb(?:\+srv)?:\/\/)(.*?)(@.*)$/);
    if (!match) return clean;

    const protocol = match[1];
    const userPass = match[2];
    let hostAndRest = match[3];

    const colonIndex = userPass.indexOf(":");
    if (colonIndex === -1) return clean;

    let rawUser = userPass.substring(0, colonIndex);
    let rawPass = userPass.substring(colonIndex + 1);

    // Strip accidental angle brackets if user enclosed username or password in <...>
    if (rawUser.startsWith("<") && rawUser.endsWith(">")) {
      rawUser = rawUser.slice(1, -1);
    }
    if (rawPass.startsWith("<") && rawPass.endsWith(">")) {
      rawPass = rawPass.slice(1, -1);
    }

    // If user or pass already contains % (partially encoded), avoid double encoding
    const safeUser = encodeURIComponent(decodeURIComponent(rawUser));
    const safePass = encodeURIComponent(decodeURIComponent(rawPass));

    // Ensure a default database path exists if missing before query parameters
    // e.g. .mongodb.net/?appName=... -> .mongodb.net/insight_nexus?appName=...
    if (hostAndRest.includes("@") && (hostAndRest.includes(".mongodb.net/?") || hostAndRest.endsWith(".mongodb.net/"))) {
      hostAndRest = hostAndRest
        .replace(".mongodb.net/?", ".mongodb.net/insight_nexus?")
        .replace(/\.mongodb\.net\/$/, ".mongodb.net/insight_nexus");
    }

    return `${protocol}${safeUser}:${safePass}${hostAndRest}`;
  } catch {
    return uri.trim();
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri || !rawUri.trim()) {
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
      serverSelectionTimeoutMS: 10000,
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
  } catch (e: any) {
    cached.promise = null;
    if (e?.message?.includes("bad auth") || e?.message?.includes("authentication failed")) {
      throw new Error(
        "MongoDB Atlas authentication failed: Please verify that your database username and password in MONGODB_URI match your MongoDB Atlas Database User."
      );
    }
    if (e?.message?.includes("Could not connect to any servers") || e?.name === "MongooseServerSelectionError") {
      throw new Error(
        "MongoDB Atlas connection timeout: Ensure that '0.0.0.0/0' (Allow access from anywhere) is enabled in your MongoDB Atlas Network Access IP whitelist for Vercel."
      );
    }
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
