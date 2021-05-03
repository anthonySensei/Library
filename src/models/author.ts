import { Document } from 'mongoose';

export interface AuthorSchema extends Document {
    name: string;
    country: string;
}
