import storage from '../config/storage';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

config();

export const uploadFileToStorage = async () => {
    const filename = uuidv4();

    return await storage.bucket(process.env.STORAGE_BUCKET_NAME as string).upload(filename, {
        gzip: true,
        metadata: {
            cacheControl: 'public, max-age=31536000',
        },
    });
};
