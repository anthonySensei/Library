const bCrypt = require('bcryptjs');

const passportJWT = require('passport-jwt');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const status = require('../constants/userStatuses');
const roles = require('../constants/roles');
const errorMessages = require('../constants/errorMessages');
const fields = require('../constants/fields');

module.exports = (passport, student, librarian) => {
    let Student = student;
    let Librarian = librarian;

    const LocalStrategy = require('passport-local').Strategy;

    passport.use(
        new LocalStrategy(
            {
                usernameField: fields.EMAIL,
                passwordField: fields.PASSWORD,
                passReqToCallback: true
            },
            (req, email, password, done) => {
                const isValidPassword = (userPass, password) => {
                    return bCrypt.compareSync(password, userPass);
                };

                Librarian.findOne({
                    where: {
                        email: email
                    }
                })
                    .then(librarian => {
                        if (!librarian) {
                            Student.findOne({
                                where: {
                                    email: email,
                                    status: status.ACTIVATED
                                }
                            })
                                .then(student => {
                                    if (!student) {
                                        return done(null, false, {
                                            message:
                                                errorMessages.INCORRECT_LOGIN_DATA
                                        });
                                    }

                                    if (
                                        !isValidPassword(
                                            student.password,
                                            password
                                        )
                                    ) {
                                        return done(null, false, {
                                            message:
                                                errorMessages.INCORRECT_LOGIN_DATA
                                        });
                                    }
                                    const studentInfo = student.get();
                                    return done(null, {
                                        ...studentInfo,
                                        role: roles.STUDENT
                                    });
                                })
                                .catch(err => {
                                    return done(null, false, {
                                        message:
                                            errorMessages.INCORRECT_LOGIN_DATA
                                    });
                                });
                        } else {
                            if (
                                !isValidPassword(librarian.password, password)
                            ) {
                                return done(null, false, {
                                    message: errorMessages.INCORRECT_LOGIN_DATA
                                });
                            }
                            const librarianInfo = librarian.get();
                            return done(null, librarianInfo);
                        }
                    })
                    .catch(err => {
                        return done(null, false, {
                            message: errorMessages.SOMETHING_WENT_WRONG
                        });
                    });
            }
        )
    );

    passport.use(
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
                secretOrKey: secret_key
            },
            function (jwtPayload, cb) {
                return Librarian.findOne({ where: { id: jwtPayload.id } })
                    .then(user => {
                        return cb(null, user);
                    })
                    .catch(err => {
                        return cb(err);
                    });
            }
        )
    );

    passport.serializeUser(function (auth, done) {
        done(null, auth.id);
    });

    passport.deserializeUser(function (id, done) {
        Librarian.findOne({ where: { id: id } }).then(function (user) {
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });
};
