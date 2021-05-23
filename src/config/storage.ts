import { Storage } from '@google-cloud/storage';
import { config } from 'dotenv';

config();

const storage = new Storage({
    keyFilename: process.env.STORAGE_SERVER_KEY,
});

export default storage;
