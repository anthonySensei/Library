import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve('src', 'assets'));
    },

    filename(req, file, cb) {
        const extension = file.originalname.split('.').pop();
        cb(null, uuidv4() + '.' + extension);
    }
});

const fileFilter = (req: Request, file: any, cb: any) => {
    if (['application/pdf'].includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(null, false);
};

export default () => multer({ limits: { fieldSize: 10 * 1024 * 1024 }, storage: fileStorage, fileFilter }).single('file');
