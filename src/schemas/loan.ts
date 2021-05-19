import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const loanSchema: Schema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    librarian: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    loanedAt: { type: Date, required: false },
    returnedAt: { type: Date, required: false }
});

export default mongoose.model('Loan', loanSchema);

