import { Document } from 'mongoose';

export interface UserSchema extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    image: string;
    active: boolean;
    admin: boolean;
    librarian: boolean;
    activationToken: string;
    comparePassword: (password: string) => boolean;
}

export interface UserModel {
    name: string;
    email: string;
    phone: string;
    password?: string;
    image: string;
    active?: boolean;
    admin?: boolean;
    librarian?: boolean;
}
