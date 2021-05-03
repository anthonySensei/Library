import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';

const genreSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    }
});

export default mongoose.model('Genre', genreSchema);
