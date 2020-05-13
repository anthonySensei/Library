const Loan = require('../models/loan');
const Student = require('../models/student');
const Librarian = require('../models/librarian');
const Book = require('../models/book');
const Department = require('../models/department');
const Author = require('../models/author');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const models = require('../constants/models');

exports.getLoanStatistic = loans => {
    const last30 = [...loans].splice(0, 30);
    const loansStatisticArr = [];
    for (const loan of last30) {
        loan.loanTime.setHours(0, 0, 0, 0);
        const loanObj = {
            books: 1,
            loanTime: loan.loanTime.toLocaleDateString()
        };
        if (loansStatisticArr.length > 0) {
            let index;
            index = loansStatisticArr.findIndex(
                statistic => statistic.loanTime === loanObj.loanTime
            );
            if (index !== -1) {
                loansStatisticArr[index].books += 1;
            } else {
                loansStatisticArr.push(loanObj);
            }
        } else {
            loansStatisticArr.push(loanObj);
        }
    }
    return loansStatisticArr;
};

exports.getLoans = async (modelId, modelName) => {
    let model;
    let condition;
    let info;
    if (modelName === models.LIBRARIAN) {
        condition = { librarianId: modelId };
        model = Student;
    } else if (modelName === models.STUDENT) {
        condition = { studentId: modelId };
        model = Librarian;
    }
    try {
        const loans = await Loan.findAll({
            where: condition,
            include: [
                {
                    model: model
                },
                { model: Book },
                { model: Department }
            ],
            order: [['loan_time', 'ASC']]
        });
        const loansArr = [];
        if (loans.length > 0) {
            loans.forEach(loan => {
                const loanData = loan.dataValues;

                if (modelName === models.LIBRARIAN)
                    info = {
                        studentTicketReader:
                            loanData.student_.dataValues.reader_ticket
                    };
                else if (modelName === models.STUDENT)
                    info = {
                        librarianEmail: loanData.librarian_.dataValues.email,
                        departmentAddress: loanData.department_.address
                    };

                loansArr.push({
                    ...info,
                    loanTime: loanData.loan_time,
                    returnedTime: loanData.returned_time,
                    bookISBN: loanData.book_.dataValues.isbn
                });
            });
            return loansArr;
        }
        return null;
    } catch (error) {
        return null;
    }
};

exports.getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.findAll({
            include: [
                {
                    model: Student
                },
                {
                    model: Librarian
                },
                {
                    model: Book,
                    include: {
                        model: Author
                    }
                },
                { model: Department }
            ],
            order: [['loan_time', 'DESC']]
        });
        const loansArr = [];
        for (const loan of loans) {
            const loanData = loan.dataValues;
            const studentData = loan.dataValues.student_.dataValues;
            const librarianData = loan.dataValues.librarian_.dataValues;
            const departmentData = loan.dataValues.department_.dataValues;
            const bookData = loan.dataValues.book_.dataValues;
            const loanObj = {
                id: loanData.id,
                loanTime: loanData.loan_time,
                returnedTime: loanData.returned_time,
                student: {
                    name: studentData.name,
                    email: studentData.email,
                    readerTicket: studentData.reader_ticket
                },
                librarian: {
                    name: librarianData.name,
                    email: librarianData.email
                },
                department: {
                    address: departmentData.address
                },
                book: {
                    bookId: bookData.id,
                    isbn: bookData.isbn,
                    name: bookData.name,
                    year: bookData.year,
                    author: bookData.author_.dataValues.name
                },
                bookISBN: bookData.isbn,
                studentReaderTicket: studentData.reader_ticket,
                librarianEmail: librarianData.email
            };
            loansArr.push(loanObj);
        }
        const data = {
            loans: loansArr,
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.returnBook = async (req, res) => {
    const loanId = req.body.loanId;
    const bookId = req.body.bookId;
    const returnedTime = req.body.returnedTime;
    if (!loanId || !bookId || !returnedTime) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
    try {
        const loan = await Loan.findOne({ where: { id: loanId } });
        await loan.update({ returned_time: returnedTime });
        const book = await Book.findOne({ where: { id: bookId } });
        await book.update({ quantity: book.get().quantity + 1 });
        const data = {
            isSuccessful: true,
            message: successMessages.SUCCESSFULLY_RETURNED_BOOK
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {}
};

exports.getLoansStatistic = (req, res) => {
    const model = req.query.model;
    const value = req.query.value;
    let userCondition = {};
    let bookCondition = {};
    if (model === models.USER) {
        userCondition = {
            reader_ticket: value
        };
    } else if (model === models.BOOK) {
        bookCondition = {
            isbn: value
        };
    } else {
        const data = {
            statistic: []
        };
        return helper.responseHandle(res, 200, data);
    }

    Loan.findAll({
        include: [
            {
                model: Student,
                where: userCondition
            },
            {
                model: Librarian
            },
            { model: Book, where: bookCondition },
            { model: Department }
        ],
        order: [['loan_time', 'ASC']],
        limit: 30
    })
        .then(loans => {
            const loansStatisticArr = [];
            for (const loan of loans) {
                const loanData = loan.dataValues;
                const studentData = loan.dataValues.student_.dataValues;
                const bookData = loan.dataValues.book_.dataValues;
                loanData.loan_time.setHours(0, 0, 0, 0);
                const loanObj = {
                    books: 1,
                    loanTime: loanData.loan_time.toLocaleDateString(),
                    returnedTime: loanData.returned_time
                        ? loanData.returned_time.toLocaleDateString()
                        : '',
                    student: {
                        name: studentData.name,
                        readerTicket: studentData.reader_ticket
                    },
                    book: {
                        name: bookData.name
                    }
                };
                if (loansStatisticArr.length > 0) {
                    let index;
                    index = loansStatisticArr.findIndex(
                        statistic => statistic.loanTime === loanObj.loanTime
                    );
                    if (index !== -1) {
                        loansStatisticArr[index].books += 1;
                    } else {
                        loansStatisticArr.push(loanObj);
                    }
                } else {
                    loansStatisticArr.push(loanObj);
                }
            }
            const data = {
                statistic: loansStatisticArr,
                message: successMessages.SUCCESSFULLY_FETCHED
            };
            return helper.responseHandle(res, 200, data);
        })
        .catch(err => {
            return helper.responseErrorHandle(
                res,
                500,
                errorMessages.CANNOT_FETCH
            );
        });
};

exports.getTopFive = (req, res) => {
    const model = req.query.model;

    Loan.findAll({
        include: [
            {
                model: Student
            },
            {
                model: Librarian
            },
            { model: Book },
            { model: Department }
        ],
        order: [['loan_time', 'ASC']],
        limit: 30
    })
        .then(loans => {
            const loansStatisticArr = [];
            const userStatisticArr = [];
            for (const loan of loans) {
                const loanData = loan.dataValues;
                const studentData = loan.dataValues.student_.dataValues;
                const bookData = loan.dataValues.book_.dataValues;
                loanData.loan_time.setHours(0, 0, 0, 0);
                const loanObj = {
                    books: 1,
                    loanTime: loanData.loan_time.toLocaleDateString(),
                    returnedTime: loanData.returned_time
                        ? loanData.returned_time.toLocaleDateString()
                        : '',
                    student: {
                        name: studentData.name,
                        readerTicket: studentData.reader_ticket
                    },
                    book: {
                        name: bookData.name
                    }
                };
                if (loansStatisticArr.length > 0) {
                    let index;
                    index = loansStatisticArr.findIndex(
                        statistic => statistic.loanTime === loanObj.loanTime
                    );
                    if (index !== -1) {
                        loansStatisticArr[index].books += 1;
                    } else {
                        loansStatisticArr.push(loanObj);
                    }
                } else {
                    loansStatisticArr.push(loanObj);
                }
            }
            const data = {
                statistic: loansStatisticArr,
                message: successMessages.SUCCESSFULLY_FETCHED
            };
            return helper.responseHandle(res, 200, data);
        })
        .catch(err => {
            return helper.responseErrorHandle(
                res,
                500,
                errorMessages.CANNOT_FETCH
            );
        });
};

exports.loanBook = async (req, res) => {
    const studentTReader = req.body.studentTicketReader;
    const librarianEmail = req.body.librarianEmail;
    const bookId = req.body.bookId;
    const loanTime = req.body.time;
    if (!req.body) {
        return helper.responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
    try {
        const student = await Student.findOne({
            where: {
                reader_ticket: studentTReader
            }
        });
        if (!student) {
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.STUDENT_WITH_THIS_READER_TICKET_DOESNT_EXIST
            );
        }

        const librarian = await Librarian.findOne({
            where: {
                email: librarianEmail
            },
            include: {
                model: Department
            }
        });
        const bookLoan = new Loan({
            loan_time: loanTime,
            studentId: student.dataValues.id,
            bookId: bookId,
            librarianId: librarian.dataValues.id,
            departmentId: librarian.dataValues.department_.dataValues.id
        });
        await bookLoan.save();
        const book = await Book.findOne({ where: { id: bookId } });
        await book.update({ quantity: book.dataValues.quantity - 1 });

        const data = {
            isSuccessful: true,
            message: successMessages.SUCCESSFULLY_LOANED
        };

        helper.responseHandle(res, 200, data);
    } catch (error) {
        helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
