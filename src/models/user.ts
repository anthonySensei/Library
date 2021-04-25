import { Document } from 'mongoose';

export interface UserModel extends Document{
    name: string;
    email: string;
    password: string;
    image: string;
    active: boolean;
    admin: boolean;
    librarian: boolean;
    comparePassword: (password: string) => boolean
}
