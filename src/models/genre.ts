import { Document } from 'mongoose';

export interface GenreSchema extends Document {
    name: string;
}
