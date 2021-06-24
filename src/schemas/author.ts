import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const authorSchema: Schema = new Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
});

export default mongoose.model('Author', authorSchema);
