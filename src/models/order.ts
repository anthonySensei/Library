import { Document } from 'mongoose';

import { UserModel, UserSchema } from './user';
import { BookModel } from './book';

export interface OrderSchema extends Document {
    user: UserModel;
    book: BookModel;
    librarian: UserSchema;
    orderedAt: Date;
    loanedAt: Date;
}
