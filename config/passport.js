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
            async (req, email, password, done) => {
                const isValidPassword = (userPass, password) => bCrypt.compareSync(password, userPass);

                try {
                    const librarian = await Librarian.findOne({where: { email }});

                    if (!librarian) {
                        const student = await Student.findOne({
                            where: {
                                email: email,
                                status: status.ACTIVATED
                            }
                        });

                        if (!student) {
                            return done(null, false, { message: errorMessages.INCORRECT_LOGIN_DATA});
                        }

                        if (!isValidPassword(student.password, password)) {
                            return done(null, false, { message: errorMessages.INCORRECT_LOGIN_DATA });
                        }

                        const studentInfo = student.get();

                        return done(null, { ...studentInfo, role: roles.STUDENT });
                    } else {
                        if (!isValidPassword(librarian.password, password)) {
                            return done(null, false, { message: errorMessages.INCORRECT_LOGIN_DATA });
                        }
                        const librarianInfo = librarian.get();

                        return done(null, librarianInfo);
                    }
                } catch (error) {
                    return done(null, false, { message: errorMessages.SOMETHING_WENT_WRONG });
                }
            }
        )
    );

    passport.use(
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
                secretOrKey: secret_key
            },
            (jwtPayload, cb) => {
                return Librarian.findOne({ where: { id: jwtPayload.id } })
                    .then(user => cb(null, user))
                    .catch(err => cb(err));
            }
        )
    );

    passport.serializeUser((auth, done) => done(null, auth.id));

    passport.deserializeUser(async (id, done) => {
        try {
            const librarian = await Librarian.findOne({ where: { id: id } });
            librarian ? done(null, librarian.get()) : done(librarian.errors, null);
        } catch (e) {
            done(librarian.errors, null);
        }
    });
};
