import { config } from 'dotenv';
import { unlinkSync } from 'fs';

import storage from '../config/storage';

import { getStorageFileUrl } from './path';
import { getImagePath } from './image';

config();

export const uploadFileToStorage = async (filepath: string) => {
    const files = await storage.upload(filepath, {
        gzip: true,
        metadata: {
            cacheControl: 'public, max-age=31536000',
        },
    });
    await unlinkSync(filepath);

    return getStorageFileUrl(files[0].id as string);
};

export const uploadImageToStorage = async (base64Img: string) => {
    const filepath = getImagePath(base64Img);
    return await uploadFileToStorage(filepath);
};
