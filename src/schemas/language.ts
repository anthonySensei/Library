import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const languageSchema: Schema = new Schema({
    englishTitle: {
        type: String,
        required: true
    },
    englishCountry: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
});

export default mongoose.model('Language', languageSchema);
