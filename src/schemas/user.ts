import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

const PASSWORD_SALT = 8;

const userSchema: mongoose.Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    librarian: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: false
    },
    activationToken: {
        type: String,
        required: false
    }
});

userSchema.pre('save', async function preSave(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // @ts-ignore
        this.password = await bcrypt.hash(this.password, PASSWORD_SALT);
        return next();
    } catch (err) {
        return next(err);
    }
});

userSchema.methods.comparePassword = async function comparePassword(password: string) {
    // @ts-ignore
    return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
