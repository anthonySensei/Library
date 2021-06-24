import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';

const genreSchema: Schema = new Schema({
    name: String
});

export default mongoose.model('Genre', genreSchema);
