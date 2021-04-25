const Student = require('../schemas/student');
const Librarian = require('../schemas/librarian');

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
