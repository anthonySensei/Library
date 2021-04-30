import { v4 as uuidv4 } from 'uuid';

const base64Img = require('base64-img');

export const convertToBase64 = (image: string) => {
    return image ? base64Img.base64Sync(image) : '';
};

export const getImagePath = (image: string) => {
    return base64Img.imgSync(image, '../images/', uuidv4());
};
