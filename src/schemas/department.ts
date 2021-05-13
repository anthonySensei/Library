import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const departmentSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
});

export default mongoose.model('Department', departmentSchema);
