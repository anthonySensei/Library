const activationPageUrl = require('./links').AUTH_ACTIVATION_PAGE_URL;

exports.subjects = {
    ACCOUNT_ACTIVATION: 'Account activation',
    ACCOUNT_CREATED: 'Account created',
    BOOK_ORDERED: 'Book ordered'
};

const messages = {
    BEST_REGARDS: `<br>
                    With best regards, <br>
                    Library`,
    BOOK_ORDERED: `Your book has been successfully ordered.
                    ${this.BEST_REGARDS}`
};
exports.messages = messages;

exports.generateActivationMessage = registrationToken => {
    return `'Hello. Please follow the link below to activate your account.
                <br />
                <a href="${process.env.ANGULAR}${activationPageUrl}?rtoken=${registrationToken}">
                    http://localhost:4200/activation-page?rtoken=${registrationToken}
                </a>
                ${messages.BEST_REGARDS}
            `;
};

exports.generatePasswordMessage = (email, password) => {
    return `Hello. Your account has been successfully created. 
            <br />
            Email: ${email}<br />
            Password: ${password}
            ${messages.BEST_REGARDS}`;
};
