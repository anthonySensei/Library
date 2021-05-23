import path from 'path';

const rootPath = path.resolve(path.join(__dirname, '../'));

export const getImagesDirPath = () =>  path.resolve(rootPath, 'images');

// TODO: fix it
export const getStorageKeyFilePath = () => path.resolve(rootPath, 'keys', 'library-699a0-d747a063fff4.json');

// TODO: Fix path
export const getStorageImageUrl = (imageId: string) =>
    `https://firebasestorage.googleapis.com/v0/b/library-699a0.appspot.com/o/${imageId}?alt=media`;
