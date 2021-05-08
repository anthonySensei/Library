import { Document } from 'mongoose';

export interface DepartmentSchema extends Document {
    name: string;
    address: string;
}
