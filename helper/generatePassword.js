const bcrypt = require('bcryptjs');

const lengthOfGeneratedPassword = 8;
const charsetOfGeneratedPassword =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const cryptPassword = password => {
    const salt = bcrypt.genSaltSync(lengthOfGeneratedPassword);
    return bcrypt.hashSync(password, salt);
};

exports.cryptPassword = cryptPassword;

exports.generatePassword = () => {
    let charset = charsetOfGeneratedPassword,
        retVal = '';
    for (let i = 0, n = charset.length; i < lengthOfGeneratedPassword; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return cryptPassword(retVal);
};

