import * as passportJWT from 'passport-jwt';
import { Request } from 'express';

import logger from './logger';

import User from '../schemas/user';
import { UserModel } from '../models/user';

import fields from '../constants/fields';
import errorMessages from '../constants/errorMessages';

const { SECRET_KEY } = process.env;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;


module.exports = (passport) => {

    const LocalStrategy = require('passport-local').Strategy;

    passport.use(
        new LocalStrategy(
            {
                usernameField: fields.EMAIL,
                passwordField: fields.PASSWORD,
                passReqToCallback: true
            },
            async (req: Request, email: string, password: string, done) => {

                try {
                    logger.info(`Login attempt ${email}`);
                    const user = await User.findOne({ email }) as UserModel;

                    if (!user) {
                        logger.warn(`User ${email} does not exist`);
                        return done(null, false, { message: errorMessages.INCORRECT_LOGIN_DATA});
                    }

                    if (!user.active) {
                        logger.warn(`User ${email} is not active`);
                        return done(null, false, { message: errorMessages.NOT_ACTIVE });
                    }

                    if (!(await user.comparePassword(password))){
                        logger.warn(`User ${email} incorrect data`);
                        return done(null, false, { message: errorMessages.INCORRECT_LOGIN_DATA });
                    }

                    return done(null, user);
                } catch (err) {
                    logger.error(`Authentication error: ${err.message}`);
                    return done(null, false, { message: errorMessages.SOMETHING_WENT_WRONG });
                }
            }
        )
    );

    passport.use(
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
                secretOrKey: SECRET_KEY
            },
            async (jwtPayload, cb) => {
                try {
                    const user = await User.findById(jwtPayload.id);
                    return cb(null, user);
                } catch (err) {
                    return cb(err);
                }
            }
        )
    );

    passport.serializeUser((auth, done) => done(null, auth.id));

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};
