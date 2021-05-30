import { Document } from 'mongoose';

export interface UserSchema extends Document {
    _id?: string;
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
    _id?: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    image: string;
    active?: boolean;
    admin?: boolean;
    librarian?: boolean;
    schedule?: any[];
}
