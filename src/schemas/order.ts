import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const orderSchema: Schema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    librarian: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    orderedAt: { type: Date, required: false },
    loanedAt: { type: Date, required: false }
});

export default mongoose.model('Order', orderSchema);

