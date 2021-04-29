export interface UpdateUserPayload {
    name: string;
    email: string;
    phone: string;
    admin?: boolean;
    librarian?: boolean;
}
