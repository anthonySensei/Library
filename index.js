if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const managerName = 'admin';
const managerEmail = 'admin@gmail.com';
const managerPassword = 'Admin123_';

const path = require('path');

const express = require('express');

const sequelize = require('./config/database');

const bodyParser = require('body-parser');

const passport = require('passport');

const bcrypt = require('bcryptjs');
const multer = require('multer');

const bookRoutes = require('./routes/book');
const loanRoutes = require('./routes/loan');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/department');

const Student = require('./models/student');
const Librarian = require('./models/librarian');
const Role = require('./models/role');
const Department = require('./models/department');
const Book = require('./models/book');
const Loan = require('./models/loan');
const Order = require('./models/order');

const roles = require('./constants/roles');

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
app.use(authRoutes);
app.use(departmentRoutes);

Book.belongsTo(Department, { foreignKey: { allowNull: false } });
Book.hasMany(Loan);

Department.hasMany(Book);

Student.hasMany(Loan);

Librarian.belongsTo(Department, { foreignKey: { allowNull: true } });

Department.hasMany(Student);
Department.hasMany(Loan);

Loan.belongsTo(Student);
Loan.belongsTo(Librarian);
Loan.belongsTo(Book);
Loan.belongsTo(Department);

Order.belongsTo(Student);
Order.belongsTo(Book);

Role.belongsTo(Librarian, { foreignKey: 'id' });

sequelize
    .sync()
    .then(result => {
        return Librarian.findOne({ where: { name: managerName } });
    })
    .then(user => {
        if (!user) {
            const manager = new Librarian({
                name: managerName,
                email: managerEmail,
                password: managerPassword
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(manager.password, salt, (err, hash) => {
                    manager.password = hash;
                    manager
                        .save()
                        .then(manager => {
                            Role.create({
                                id: manager.dataValues.id,
                                role: roles.MANAGER
                            })
                                .then()
                                .catch();
                        })
                        .catch();
                });
            });
        }
        app.listen(port);
    })
    .catch();
