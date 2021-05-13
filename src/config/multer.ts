import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },

    filename(req, file, cb) {
        const extension = file.originalname.split('.').pop();
        cb(null, uuidv4() + '.' + extension);
    }
});

const fileFilter = (req: Request, file: any, cb: any) => {
    if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(null, false);
};

export default () => multer({ limits: { fieldSize: 10 * 1024 * 1024 }, storage: imageStorage, fileFilter }).single('image');
