import path from 'path';
import { config } from 'dotenv';

config();

export const rootPath = path.resolve(path.join(__dirname, '../'));

export const getImagesDirPath = () =>  path.resolve(rootPath, 'images');

export const getStorageKeyFilePath = () => path.resolve(rootPath, 'keys', process.env.STORAGE_FILE_NAME as string);

// TODO: Fix path
export const getStorageImageUrl = (imageId: string) =>
    `https://firebasestorage.googleapis.com/v0/b/library-699a0.appspot.com/o/${imageId}?alt=media`;
