import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

const { MAIL_SERVICE, MAIL_SERVICE_USER, MAIL_SERVICE_PASS } = process.env;

const transporter = nodemailer.createTransport({
    service: MAIL_SERVICE,
    auth: {
        user: MAIL_SERVICE_USER,
        pass: MAIL_SERVICE_PASS
    }
});

export const sendMail = (email: string, subject: string, message: string) => {
    const options = { from: MAIL_SERVICE_USER, to: email, subject, html: message };
    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => err ? reject(err) : resolve(info));
    });
};
