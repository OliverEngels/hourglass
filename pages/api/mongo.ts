import { MongoClient } from "mongodb";

const dev = process.env.NEXT_PUBLIC_ENV === "dev";

const uri = `mongodb://${process.env.NEXT_PUBLIC_MONGO_USER}:${process.env.NEXT_PUBLIC_MONGO_API_PASSWORD}@${dev ? 'localhost' : 'mongo'}:27017/${process.env.NEXT_PUBLIC_MONGO_DB}`;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
    throw new Error("Please add your Mongo URI to .env.local");
}

if (!dev) {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
