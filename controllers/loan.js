const { Sequelize, literal } = require('sequelize');
const Op = Sequelize.Op;

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
const filters = require('../constants/filters');

const getCondition = (departmentId, loanDate, nextDay, isShowDebtors) => {
    let departmentCondition = {};
    let dateCondition = {};
    let isShowDebtorsCondition = {};

    if (departmentId) departmentCondition = { departmentId: departmentId };
    if (loanDate) dateCondition = { loan_time: { [Op.between]: [loanDate, nextDay] }};
    if (isShowDebtors === 'true') isShowDebtorsCondition = {  returned_time: null };

    return {
        ...departmentCondition,
        ...dateCondition,
        ...isShowDebtorsCondition
    };
};

exports.getAllLoans = async (req, res) => {
    const page = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;
    const sortOrder = req.query.sortOrder.toUpperCase();
    const filterName = req.query.filterName;
    const filterValue = req.query.filterValue;
    const departmentId = +req.query.departmentId;
    const loanDate = req.query.loanDate;
    const nextDay = req.query.nextDay;
    const isShowDebtors = req.query.isShowDebtors;
    const librarianId = +req.query.librarianId;
    const studentId = +req.query.studentId;
    let studentCondition = {};
    let librarianCondition = {};
    let bookCondition = {};

    const like = { [Op.iLike]: `%${filterValue}%` };
    if (filterName === filters.EMAIL) librarianCondition = { email: like };
    else if (filterName === filters.READER_TICKET) studentCondition = { reader_ticket: like };
    else if (filterName === filters.ISBN) bookCondition = { isbn: like };

    if (studentId) studentCondition = { id: studentId };
    else if (librarianId) librarianCondition = { id: librarianId };

    const includeArr = [
        {
            model: Student,
            where: studentCondition
        },
        {
            model: Librarian,
            where: librarianCondition
        },
        {
            model: Book,
            include: { model: Author },
            where: bookCondition
        },
        { model: Department }
    ];

    try {
        const quantity = await Loan.count({
            include: includeArr,
            where: getCondition(departmentId, loanDate, nextDay, isShowDebtors)
        });
        const loans = await Loan.findAll({
            include: includeArr,
            where: getCondition(departmentId, loanDate, nextDay, isShowDebtors),
            limit: pageSize,
            order: [['loan_time', sortOrder]],
            offset: (page - 1) * pageSize
        });
        const loansArr = [];

        for (const loan of loans) {
            const loanValues = loan.get();
            const studentData = loanValues.student_.get();
            const librarianData = loanValues.librarian_.get();
            const departmentData = loanValues.department_.get();
            const bookData = loanValues.book_.get();
            let loanObj = {
                id: loanValues.id,
                loanTime: loanValues.loan_time,
                returnedTime: loanValues.returned_time,
                bookISBN: bookData.isbn
            };

            if (!librarianId && !studentId) {
                loanObj = {
                    ...loanObj,
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
                        author: bookData.author_.get().name
                    }
                };
            }

            if (librarianId) {
                loanObj = {
                    ...loanObj,
                    departmentAddress: departmentData.address,
                    studentReaderTicket: studentData.reader_ticket
                };
            }

            if (studentId) {
                loanObj = { ...loanObj, librarianEmail: librarianData.email };
            }

            loansArr.push(loanObj);
        }

        const data = {
            loans: loansArr,
            message: successMessages.SUCCESSFULLY_FETCHED,
            quantity: quantity
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.getLoanStatistic = loans => {
    let last30;

    if (loans) last30 = [...loans].splice(0, 30);
    else last30 = [];

    const loansStatisticArr = [];
    for (const loan of last30) {
        loan.loanTime.setHours(0, 0, 0, 0);
        const loanObj = { books: 1, loanTime: loan.loanTime.toLocaleDateString() };

        if (loansStatisticArr.length > 0) {
            let index;
            index = loansStatisticArr.findIndex(statistic => statistic.loanTime === loanObj.loanTime);
            index !== -1 ? loansStatisticArr[index].books += 1 : loansStatisticArr.push(loanObj);
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
                { model },
                { model: Book },
                { model: Department }
            ],
            order: [['loan_time', 'ASC']]
        });
        const loansArr = [];
        if (loans.length > 0) {
            loans.forEach(loan => {
                const loanValues = loan.get();

                if (modelName === models.LIBRARIAN) info = { studentTicketReader: loanValues.student_.get().reader_ticket};
                else if (modelName === models.STUDENT) info = { librarianEmail: loanValues.librarian_.get().email, departmentAddress: loanValues.department_.get().address };

                loansArr.push({
                    ...info,
                    loanTime: loanValues.loan_time,
                    returnedTime: loanValues.returned_time,
                    bookISBN: loanValues.book_.get().isbn
                });
            });
            return loansArr;
        }
        return null;
    } catch (err) {
        return null;
    }
};

exports.returnBook = async (req, res) => {
    const loanId = req.body.loanId;
    const bookId = req.body.bookId;
    const returnedTime = req.body.returnedTime;

    if (!loanId || !bookId || !returnedTime) {
        return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        const loan = await Loan.findOne({ where: { id: loanId } });
        await loan.update({ returned_time: returnedTime });
        const book = await Book.findOne({ where: { id: bookId } });
        await book.update({ quantity: book.get().quantity + 1 });
        const data = { isSuccessful: true, message: successMessages.SUCCESSFULLY_RETURNED_BOOK };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.getLoansStatistic = (req, res) => {
    const model = req.query.model;
    const value = req.query.value;
    let userCondition = {};
    let bookCondition = {};
    let librarianCondition = {};
    let departmentCondition = {};
    if (model === models.USER) {
        userCondition = { reader_ticket: value };
    } else if (model === models.BOOK) {
        bookCondition = { isbn: value };
    } else if (model === models.LIBRARIAN) {
        librarianCondition = { email: value };
    } else if (model === models.DEPARTMENT) {
        departmentCondition = { id: value };
    } else {
        const data = { statistic: [] };
        return helper.responseHandle(res, 200, data);
    }

    Loan.findAll({
        include: [
            {
                model: Student,
                where: userCondition
            },
            {
                model: Librarian,
                where: librarianCondition
            },
            { model: Book, where: bookCondition },
            { model: Department, where: departmentCondition }
        ],
        where: { loan_time: { [Op.gte]: new Date().setDate(new Date().getDate() - 30) } },
        order: [['loan_time', 'ASC']]
    })
        .then(loans => {
            const loansStatisticArr = [];

            for (const loan of loans) {
                const loanValues = loan.get();
                const studentData = loanValues.student_.get();
                const bookData = loanValues.book_.get();
                loanValues.loan_time.setHours(0, 0, 0, 0);
                const loanObj = {
                    books: 1,
                    loanTime: loanValues.loan_time.toLocaleDateString(),
                    returnedTime: loanValues.returned_time
                        ? loanValues.returned_time.toLocaleDateString()
                        : '',
                    student: {
                        name: studentData.name,
                        readerTicket: studentData.reader_ticket
                    },
                    book: {
                        name: bookData.name
                    },
                    librarian: {
                        name: loanValues.librarian_.get().name
                    },
                    department: {
                        address: loanValues.department_.get().address
                    }
                };

                if (loansStatisticArr.length > 0) {
                    let index;
                    index = loansStatisticArr.findIndex(statistic => statistic.loanTime === loanObj.loanTime);
                    index !== -1 ? loansStatisticArr[index].books += 1 : loansStatisticArr.push(loanObj);
                } else {
                    loansStatisticArr.push(loanObj);
                }
            }
            const data = { statistic: loansStatisticArr, message: successMessages.SUCCESSFULLY_FETCHED };
            return helper.responseHandle(res, 200, data);
        })
        .catch(err => {
            return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
        });
};

exports.loanBook = async (req, res) => {
    const studentTReader = req.body.studentTicketReader;
    const librarianEmail = req.body.librarianEmail;
    const bookId = req.body.bookId;
    const loanTime = req.body.time;

    if (!req.body) {
        return helper.responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        const student = await Student.findOne({
            where: {
                reader_ticket: studentTReader
            }
        });

        if (!student) {
            return helper.responseErrorHandle(res, 400, errorMessages.STUDENT_WITH_THIS_READER_TICKET_DOESNT_EXIST);
        }

        const librarian = await Librarian.findOne({
            where: { email: librarianEmail },
            include: { model: Department }
        });
        const book = await Book.findOne({ where: { id: bookId } });

        if (book.get().quantity <= 0) {
            return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
        } else {
            const bookLoan = new Loan({
                loan_time: loanTime,
                studentId: student.get().id,
                bookId: bookId,
                librarianId: librarian.get().id,
                departmentId: librarian.get().department_.get().id
            });
            await bookLoan.save();
            await book.update({ quantity: book.get().quantity - 1 });

            const data = { isSuccessful: true, message: successMessages.SUCCESSFULLY_LOANED };
            helper.responseHandle(res, 200, data);
        }
    } catch (error) {
        return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
