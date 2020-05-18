const Student = require('../models/student');
const Librarian = require('../models/librarian');

exports.checkReaderTicket = readerTicket => {
    return Student.findOne({
        where: {
            reader_ticket: readerTicket
        }
    });
};

exports.checkEmail = async email => {
    const librarian = await Librarian.findOne({ where: { email: email } });
    if (librarian) return librarian;
    const student = await Student.findOne({ where: { email: email } });
    if (student) return student;
    return false;
};
