import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import { config } from 'dotenv';
import * as path from 'path';

import cors from './config/cors';
import connectMongoDB from './config/db';
import logger from './config/logger';
import sequelize from './config/database';
import multer from './config/multer';

import authorRoutes from './routes/author';
import authRoutes from './routes/auth';
import genreRoutes from './routes/genre';
import librarianRoutes from './routes/librarian';
import studentRoutes from './routes/student';
import userRoutes from './routes/user';

if (process.env.NODE_ENV !== 'production') {
    config();
}

const bookRoutes = require('./routes/book');
const loanRoutes = require('./routes/loan');
const orderRoutes = require('./routes/order');
const periodRoutes = require('./routes/period');
const scheduleRoutes = require('./routes/schedule');

const Student = require('./schemas/student');
const Librarian = require('./schemas/librarian');
const Role = require('./schemas/role');
const Department = require('./schemas/sdepartment');
const Book = require('./schemas/sbook');
const Genre = require('./schemas/sgenre');
const Author = require('./schemas/sauthor');
const Loan = require('./schemas/loan');
const Order = require('./schemas/order');
const Schedule = require('./schemas/schedule');
const Period = require('./schemas/period');

const authorsUrl = require('./constants/links').AUTHORS_URL;
const booksUrl = require('./constants/links').BOOKS_URL;
const librariansUrl = require('./constants/links').LIBRARIANS_URL;
const genresUrl = require('./constants/links').GENRES_URL;
const ordersUrl = require('./constants/links').ORDERS_URL;
const loansUrl = require('./constants/links').LOANS_URL;
const studentsUrl = require('./constants/links').STUDENTS_URL;
const usersUrl = require('./constants/links').USERS_URL;
const periodsUrl = require('./constants/links').PERIODS_URL;
const schedulesUrl = require('./constants/links').SCHEDULES_URL;

const app = express();

const port = process.env.PORT || 3000;
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));
app.use('images', express.static(path.join(__dirname, 'images')));
app.use(cors);

app.use(authRoutes);
app.use(authorsUrl, authorRoutes);
app.use(booksUrl, bookRoutes);
app.use(genresUrl, genreRoutes);
app.use(librariansUrl, librarianRoutes);
app.use(loansUrl, loanRoutes);
app.use(ordersUrl, orderRoutes);
app.use(studentsUrl, studentRoutes);
app.use(usersUrl, userRoutes);
app.use(periodsUrl, periodRoutes);
app.use(schedulesUrl, scheduleRoutes);
app.use(schedulesUrl, scheduleRoutes);

Book.belongsTo(Department, { foreignKey: { allowNull: false } });
Book.belongsTo(Author);
Book.belongsTo(Genre);
Book.hasMany(Loan);

Department.hasMany(Book);

Student.hasMany(Loan);
Student.hasMany(Order);

Schedule.belongsTo(Librarian);

Librarian.belongsTo(Department, { foreignKey: { allowNull: true } });
Librarian.hasMany(Loan);
Librarian.hasMany(Schedule);

Schedule.belongsTo(Period);

Role.belongsTo(Librarian, { foreignKey: 'librarian_id' });

Department.hasMany(Librarian);
Department.hasMany(Loan);

Loan.belongsTo(Student);
Loan.belongsTo(Librarian);
Loan.belongsTo(Book);
Loan.belongsTo(Department);

Order.belongsTo(Student);
Order.belongsTo(Book);
Order.belongsTo(Department);

sequelize
    .sync()
    .then(() => {
        connectMongoDB()
            .then(() => {
                app.listen(port);
                logger.info('Successfully connected to MongoDB');
                logger.info('App is listening on', port);
             })
            .catch(err => {
                logger.error('Cannot connect to MongoDB. Error:', err.message);
                return;
            });
    });
