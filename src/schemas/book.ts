import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const bookSchema: Schema = new Schema({
    isbn: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    authors: [
        {
            author: { type: Schema.Types.ObjectId, ref: 'Author', required: true }
        }
    ],
    genres: [
        {
            genre: { type: Schema.Types.ObjectId, ref: 'Genre', required: true }
        }
    ]
});

export default mongoose.model('Book', bookSchema);

