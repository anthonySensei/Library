import { Express } from 'express';

import { AUTHORS_URL, BOOKS_URL, GENRES_URL, LIBRARIANS_URL, LOANS_URL } from '../constants/links';
import { ORDERS_URL, STUDENTS_URL, USERS_URL, SCHEDULES_URL } from '../constants/links';

import authRoutes from './auth';
import authorRoutes from './author';
import bookRoutes from './book';
import genreRoutes from './genre';
import librarianRoutes from './librarian';
import loanRoutes from './loan';
import orderRoutes from './order';
import studentRoutes from './student';
import userRoutes from './user';
import scheduleRoutes from './schedule';

export default (app: Express) => {
    app.use(authRoutes);
    app.use(AUTHORS_URL, authorRoutes);
    app.use(BOOKS_URL, bookRoutes);
    app.use(GENRES_URL, genreRoutes);
    app.use(LIBRARIANS_URL, librarianRoutes);
    app.use(LOANS_URL.baseUrl, loanRoutes);
    app.use(ORDERS_URL, orderRoutes);
    app.use(STUDENTS_URL, studentRoutes);
    app.use(USERS_URL, userRoutes);
    app.use(SCHEDULES_URL, scheduleRoutes);
};
