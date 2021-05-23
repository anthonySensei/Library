import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import { config } from 'dotenv';
import path from 'path';

import cors from './config/cors';
import connectMongoDB from './config/db';
import logger from './config/logger';
import multer from './config/multer';
import usePassport from './config/passport';

import useRoutes from './routes/index';

if (process.env.NODE_ENV !== 'production') {
    config();
}

const app = express();
const port = process.env.PORT || 3000;

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));
app.use('images', express.static(path.join(__dirname, 'images')));
app.use(cors);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('angular/dist/angular'));
}

usePassport(passport);
useRoutes(app);

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname + '/../angular/dist/angular/index.html'));
});

(async () => {
    try {
        await connectMongoDB();
        app.listen(port);
        logger.info('Successfully connected to MongoDB');
        logger.info('App is listening on', port);
    } catch (err) {
        logger.error('Cannot connect to MongoDB. Error:', err.message);
    }
})();
