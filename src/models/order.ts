import { Document } from 'mongoose';

import { UserModel, UserSchema } from './user';
import { BookModel } from './book';

export interface LoanSchema extends Document {
    user: UserModel;
    book: BookModel;
    librarian: UserSchema;
    loanedAt: Date;
    returnedAt: Date;
}

export interface Statistic {
    name: string;
    value: number;
}
