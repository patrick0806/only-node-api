import { Db, MongoClient } from "mongodb";

export class MongoConnection {
    private static instance: MongoConnection;
    private URI = process.env.MONGO_URI!;
    private client: MongoClient;
    private db: Db;

    public static getInstance(): MongoConnection {
        if (!MongoConnection.instance) {
            MongoConnection.instance = new MongoConnection();
        }
        return MongoConnection.instance;
    }

    public async connection() {
        try {
            this.client = new MongoClient(this.URI);
            await this.client.connect();
            this.db = this.client.db("approve-it");
            console.log('Connected with Mongo database with success')
        } catch (error) {
            throw new Error('Fail to connect on mongodb', { cause: error });
        }
    }

    public getCollection(collectionName: string) {
        try {
            return this.db.collection(collectionName);
        } catch (error) {
            throw new Error(`Fail to get collection: ${collectionName}`, { cause: error });
        }
    }

    public async close(): Promise<void> {
        await this.client.close();
    }
}