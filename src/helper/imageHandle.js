const base64Img = require('base64-img');
const uuidv4 = require('uuid/v4');

exports.convertToBase64 = image => {
    return image ? base64Img.base64Sync(image) : '';
};

exports.getPath = image => {
    return base64Img.imgSync(image, '../images/', uuidv4());
};
