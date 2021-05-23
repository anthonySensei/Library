import { config } from 'dotenv';
import { unlinkSync } from 'fs';

import storage from '../config/storage';

import { getStorageImageUrl } from './path';
import { getImagePath } from './image';

config();

export const uploadImageToStorage = async (base64Img: string) => {
    const filepath = getImagePath(base64Img);
    const files = await storage.upload(filepath, {
        gzip: true,
        metadata: {
            cacheControl: 'public, max-age=31536000',
        },
    });
    await unlinkSync(filepath);

    return getStorageImageUrl(files[0].id as string);
};
