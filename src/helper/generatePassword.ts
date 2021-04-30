const bcrypt = require('bcryptjs');

const lengthOfGeneratedPassword = 8;
const charsetOfGeneratedPassword =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const cryptPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(lengthOfGeneratedPassword);
    return bcrypt.hashSync(password, salt);
};

exports.cryptPassword = cryptPassword;

exports.generatePassword = () => {
    const charset = charsetOfGeneratedPassword;
    let retVal = '';

    for (let i = 0, n = charset.length; i < lengthOfGeneratedPassword; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    return { encrypted: cryptPassword(retVal), password: retVal };
};

export const generatePassword = () => {
    const charset = charsetOfGeneratedPassword;
    let password = '';

    for (let i = 0, n = charset.length; i < lengthOfGeneratedPassword; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }

    return password;
};
