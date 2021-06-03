import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';

const genreSchema: Schema = new Schema({
    name: { en: String, uk: String }
});

export default mongoose.model('Genre', genreSchema);
