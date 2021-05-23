import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import { config } from 'dotenv';
import path from 'path';

import cors from './config/cors';
import connectMongoDB from './config/db';
import logger from './config/logger';
import multer from './config/multer';

import authorRoutes from './routes/author';
import authRoutes from './routes/auth';
import genreRoutes from './routes/genre';
import librarianRoutes from './routes/librarian';
import studentRoutes from './routes/student';
import userRoutes from './routes/user';
import bookRoutes from './routes/book';
import loanRoutes from './routes/loan';
import orderRoutes from './routes/order';

import { AUTHORS_URL, BOOKS_URL, GENRES_URL, LIBRARIANS_URL, LOANS_URL, ORDERS_URL, STUDENTS_URL, USERS_URL } from './constants/links';

import usePassport from './config/passport';

if (process.env.NODE_ENV !== 'production') {
    config();
}

const scheduleRoutes = require('./routes/schedule');

const schedulesUrl = require('./constants/links').SCHEDULES_URL;

const app = express();

const port = process.env.PORT || 3000;
app.use(passport.initialize());
app.use(passport.session());

usePassport(passport);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));
app.use('images', express.static(path.join(__dirname, 'images')));
app.use(cors);

app.use(authRoutes);
app.use(AUTHORS_URL, authorRoutes);
app.use(BOOKS_URL, bookRoutes);
app.use(GENRES_URL, genreRoutes);
app.use(LIBRARIANS_URL, librarianRoutes);
app.use(LOANS_URL.baseUrl, loanRoutes);
app.use(ORDERS_URL, orderRoutes);
app.use(STUDENTS_URL, studentRoutes);
app.use(USERS_URL, userRoutes);
app.use(schedulesUrl, scheduleRoutes);

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
