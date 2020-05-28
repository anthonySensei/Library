const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
    sendGridTransport({
        auth: {
            api_key: process.env.SEND_GRID_API_KEY
        }
    })
);

exports.sendMail = (email, subject, message) => {
    return transporter.sendMail({
        to: email,
        from: process.env.EVENTS_PLACE_EMAIL_ADDRESS,
        subject: subject,
        html: message
    });
};
