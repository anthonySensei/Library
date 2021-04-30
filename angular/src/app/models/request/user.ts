export interface UpdateUserPayload {
    name: string;
    email: string;
    phone: string;
    admin?: boolean;
    librarian?: boolean;
}

export interface RegisterUserPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface UpdatePasswordPayload {
    oldPassword: string;
    newPassword: string;
};
