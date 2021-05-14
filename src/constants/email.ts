import { CLIENT_AUTH_ACTIVATION_PAGE_URL } from './links';

export const emailSubjects = {
    ACCOUNT_ACTIVATION: 'Account activation',
    ACCOUNT_CREATED: 'Account created',
    BOOK_ORDERED: 'Book ordered'
};

export const emailMessages = {
    BEST_REGARDS: `<br>
                   With best regards,
                   <br>
                   Library`,
};

export const generateUserActivationMessage = (token: string) => {
    return `Hello. Please follow the link below to activate your account.
                <br />
                <a href="${process.env.ANGULAR}${CLIENT_AUTH_ACTIVATION_PAGE_URL}?token=${token}">
                    ${process.env.ANGULAR}${CLIENT_AUTH_ACTIVATION_PAGE_URL}?token=${token}
                </a>
                ${emailMessages.BEST_REGARDS}
            `;
};

export const generateUserCreationMessage = (email: string, password: string) => {
    return `Hello. Your account has been successfully created.
            <br />
            Email: ${email}<br />
            Password: ${password}
            ${emailMessages.BEST_REGARDS}`;
};
