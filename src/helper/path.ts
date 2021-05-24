import path from 'path';
import { config } from 'dotenv';

config();

export const rootPath = path.resolve(path.join(__dirname, '../'));

export const getImagesDirPath = () =>  path.resolve(rootPath, 'assets');

export const getStorageKeyFilePath = () => path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS as string);

// TODO: Fix path
export const getStorageFileUrl = (imageId: string) =>
    `https://firebasestorage.googleapis.com/v0/b/library-699a0.appspot.com/o/${imageId}?alt=media`;
