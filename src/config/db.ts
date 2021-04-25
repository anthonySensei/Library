import * as mongoose from 'mongoose';

require('dotenv').config();

const { MONGO_USER, MONGO_PASSWORD, MONGO_CLUSTER, MONGO_DB_NAME } = process.env;
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`;
export default () => mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

