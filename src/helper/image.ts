import { v4 as uuidv4 } from 'uuid';

import { getImagesDirPath } from './path';

const base64Img = require('base64-img');

export const getImagePath = (image: string) => {
    return base64Img.imgSync(image, getImagesDirPath(), uuidv4());
};
