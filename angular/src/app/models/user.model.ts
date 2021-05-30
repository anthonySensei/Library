export interface User {
    _id: string;
    name: string;
    email: string;
    image?: string;
    password?: string;
    phone: string;
    active: boolean;
    admin: boolean;
    librarian: boolean;
    createdAt: string;
}
