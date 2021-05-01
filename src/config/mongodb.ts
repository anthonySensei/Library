import { MongoClient } from 'mongodb';

const { MONGO_USER, MONGO_PASSWORD, MONGO_CLUSTER, MONGO_DB_NAME } = process.env;
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useUnifiedTopology: true });

export default mongoClient;

