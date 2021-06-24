import { Storage } from '@google-cloud/storage';
import { config } from 'dotenv';

import { getStorageKeyFilePath } from '../helper/path';

config();

const storage = new Storage({
    keyFilename: getStorageKeyFilePath(),
    projectId: process.env.STORAGE_PROJECT_ID
});

export default storage.bucket(process.env.STORAGE_BUCKET_NAME as string);
