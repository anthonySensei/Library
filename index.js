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
const userRoutes = require('./routes/user');
const studentRoutes = require('./routes/student');
const librarianRoutes = require('./routes/librarian');
const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/department');

const Student = require('./models/student');
const Librarian = require('./models/librarian');
const Role = require('./models/role');
const Department = require('./models/department');
const Book = require('./models/book');
const Author = require('./models/author');
const Loan = require('./models/loan');
const Order = require('./models/order');
const Schedule = require('./models/schedule');

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
app.use(
    multer({
        limits: { fieldSize: 5 * 1024 * 1024 },
        storage: imageStorage,
        fileFilter: fileFilter
    }).single('image')
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ANGULAR);
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET, PATCH, PUT, POST, DELETE, OPTIONS'
    );
    next();
});

app.use(bookRoutes);
app.use(loanRoutes);
app.use(userRoutes);
app.use(studentRoutes);
app.use(librarianRoutes);
app.use(authRoutes);
app.use(departmentRoutes);

Book.belongsTo(Department, { foreignKey: { allowNull: false } });
Book.belongsTo(Author);
Book.hasMany(Loan);

Department.hasMany(Book);

Student.hasMany(Loan);
Student.hasMany(Order);

Schedule.belongsTo(Librarian);

Librarian.belongsTo(Department, { foreignKey: { allowNull: true } });
Librarian.hasMany(Loan);
Librarian.hasMany(Schedule);

Role.belongsTo(Librarian, { foreignKey: 'id' });

Department.hasMany(Librarian);
Department.hasMany(Loan);

Loan.belongsTo(Student);
Loan.belongsTo(Librarian);
Loan.belongsTo(Book);
Loan.belongsTo(Department);

Order.belongsTo(Student);
Order.belongsTo(Book);

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
                                    dep.dataValues.id
                                );
                            })
                            .catch();
                    } else {
                        helper.createManager(
                            managerName,
                            managerEmail,
                            managerPassword,
                            depart.dataValues.id
                        );
                    }
                })
                .catch();
        }
        app.listen(port);
    })
    .catch();
