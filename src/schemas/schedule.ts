import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const scheduleSchema: Schema = new Schema({
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    weekDays: { type: [String], required: true },
    librarian: { type: Schema.Types.ObjectId, ref: 'User', required: false },
});

export default mongoose.model('Schedule', scheduleSchema);
