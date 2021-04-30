const lengthOfGeneratedPassword = 8;
const charsetOfGeneratedPassword = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const generatePassword = () => {
    const charset = charsetOfGeneratedPassword;
    let password = '';

    for (let i = 0, n = charset.length; i < lengthOfGeneratedPassword; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }

    return password;
};
