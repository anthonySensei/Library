import cors from './config/cors';
import connectMongoDB from './config/db';
import logger from './config/logger';

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const managerName = 'admin';
const managerEmail = 'admin@gmail.com';
const managerPassword = 'Admin123_';

const departmentAddress = 'Main address';

const path = require('path');

const express = require('express');

const sequelize = require('./config/database');

const bodyParser = require('body-parser');

const passport = require('passport');

const multer = require('multer');

const bookRoutes = require('./routes/book');
const loanRoutes = require('./routes/loan');
const orderRoutes = require('./routes/order');
const userRoutes = require('./routes/user');
const studentRoutes = require('./routes/student');
const librarianRoutes = require('./routes/librarian');
const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/department');
const authorRoutes = require('./routes/author');
const genreRoutes = require('./routes/genre');
const periodRoutes = require('./routes/period');
const scheduleRoutes = require('./routes/schedule');

const Student = require('./schemas/student');
const Librarian = require('./schemas/librarian');
const Role = require('./schemas/role');
const Department = require('./schemas/department');
const Book = require('./schemas/book');
const Genre = require('./schemas/genre');
const Author = require('./schemas/author');
const Loan = require('./schemas/loan');
const Order = require('./schemas/order');
const Schedule = require('./schemas/schedule');
const Period = require('./schemas/period');

const authorsUrl = require('./constants/links').AUTHORS_URL;
const departmentsUrl = require('./constants/links').DEPARTMENTS_URL;
const booksUrl = require('./constants/links').BOOKS_URL;
const librariansUrl = require('./constants/links').LIBRARIANS_URL;
const genresUrl = require('./constants/links').GENRES_URL;
const ordersUrl = require('./constants/links').ORDERS_URL;
const loansUrl = require('./constants/links').LOANS_URL;
const studentsUrl = require('./constants/links').STUDENTS_URL;
const myAccountUrl = require('./constants/links').MY_ACCOUNT_URL;
const periodsUrl = require('./constants/links').PERIODS_URL;
const schedulesUrl = require('./constants/links').SCHEDULES_URL;

const helper = require('./helper/createManager');

const app = express();

const port = process.env.PORT || 3000;

const uuidv4 = require('uuid/v4');

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport, Student, Librarian);

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },

    filename: function (req, file, cb) {
        let extension = file.originalname.split('.').pop();
        cb(null, uuidv4() + '.' + extension);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({
        limits: { fieldSize: 5 * 1024 * 1024 },
        storage: imageStorage,
        fileFilter: fileFilter
    }).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('images', express.static(path.join(__dirname, 'images')));

app.use(cors);

app.use(authRoutes);
app.use(authorsUrl, authorRoutes);
app.use(booksUrl, bookRoutes);
app.use(departmentsUrl, departmentRoutes);
app.use(genresUrl, genreRoutes);
app.use(librariansUrl, librarianRoutes);
app.use(loansUrl, loanRoutes);
app.use(ordersUrl, orderRoutes);
app.use(studentsUrl, studentRoutes);
app.use(myAccountUrl, userRoutes);
app.use(periodsUrl, periodRoutes);
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
    .then(result => {
        return Librarian.findOne({ where: { name: managerName } });
    })
    .then(user => {
        if (!user) {
            Department.findOne({ where: { address: departmentAddress } })
                .then(depart => {
                    if (!depart) {
                        const department = new Department({
                            address: departmentAddress
                        });
                        department
                            .save()
                            .then(dep => {
                                helper.createManager(
                                    managerName,
                                    managerEmail,
                                    managerPassword,
                                    dep.get().id
                                );
                            })
                            .catch();
                    } else {
                        helper.createManager(
                            managerName,
                            managerEmail,
                            managerPassword,
                            depart.get().id
                        );
                    }
                })
                .catch();
        }
        connectMongoDB()
            .then((mongoClient) => {
                app.listen(port);
                logger.info('Successfully connected to MongoDB:');
                logger.info('App is listening on', port);
             })
            .catch(err => {
                logger.error('Cannot connect to MongoDB. Error:', err.message);
                return;
            })
    })
    .catch();