const Book = require('../models/book');
const Librarian = require('../models/librarian');
const Loan = require('../models/loan');
const Department = require('../models/department');
const Role = require('../models/role');
const Schedule = require('../models/schedule');
const Student = require('../models/student');

const roles = require('../constants/roles');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

const getLibrarianRole = async librarianId => {
    try {
        const role = await Role.findOne({
            where: { librarian_id: librarianId }
        });
        return role.dataValues.role;
    } catch (error) {
        return null;
    }
};

const getLibrarianSchedule = async librarianId => {
    try {
        const schedules = await Schedule.findAll({
            where: { librarianId: librarianId }
        });
        const scheduleArr = [];
        if (schedules.length > 0) {
            schedules.forEach(schedule => {
                const scheduleValues = schedule.dataValues;
                scheduleArr.push({
                    day: scheduleValues.dayOfWeek,
                    start: scheduleValues.start_time,
                    end: scheduleValues.end_time
                });
            });
            return scheduleArr;
        }
        return null;
    } catch (error) {
        return null;
    }
};

const getLibrarianLoans = async librarianId => {
    try {
        const loans = await Loan.findAll({
            where: { librarianId: librarianId },
            include: [
                {
                    model: Student,
                },
                { model: Book }
            ],
            order: [['loan_time', 'ASC']]
        });
        const loansArr = [];
        if (loans.length > 0) {
            loans.forEach(loan => {
                const loanData = loan.dataValues;
                const studentData = loanData.student_.dataValues;
                const bookData = loanData.book_.dataValues;
                loansArr.push({
                    loanTime: loanData.loan_time,
                    returnedTime: loanData.returned_time,
                    bookISBN: bookData.isbn,
                    studentTicketReader: studentData.reader_ticket
                });
            });
            return loansArr;
        }
        return null;
    } catch (error) {
        return null;
    }
};

const getLibrarianLoanStatistic = (librarianLoans,)  => {
    const last30 = [...librarianLoans].splice(0, 30);
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

exports.getLibrarians = async (req, res) => {
    const librarians = await Librarian.findAll({
        include: { model: Department }
    });
    const librariansArr = [];
    for (const librarian of librarians) {
        const librarianValues = librarian.dataValues;
        try {
            const librarianRole = await getLibrarianRole(librarianValues.id);
            if (librarianRole === roles.LIBRARIAN) {
                if (librarianValues.profile_image) {
                    librarianValues.profile_image = base64Img.base64Sync(
                        librarianValues.profile_image
                    );
                } else {
                    librarianValues.profile_image = '';
                }
                const librarianSchedule = await getLibrarianSchedule(
                    librarianValues.id
                );
                const librarianData = {
                    id: librarianValues.id,
                    name: librarianValues.name,
                    email: librarianValues.email,
                    profileImage: librarianValues.profile_image,
                    departmentAddress:
                        librarianValues.department_.dataValues.address,
                    schedule: librarianSchedule
                };
                librariansArr.push(librarianData);
                const data = {
                    message: successMessages.SUCCESSFULLY_FETCHED,
                    librarians: librariansArr
                };
                return helper.responseHandle(res, 200, data);
            }
        } catch (error) {
            return helper.responseErrorHandle(res, 400, error);
        }
    }
};

exports.getLibrarian = async (req, res) => {
    const librarianId = req.query.librarianId;
    try {
        const librarian = await Librarian.findOne({
            where: {
                id: librarianId
            },
            include: { model: Department }
        });
        const librarianValues = librarian.dataValues;
        if (librarianValues.profile_image) {
            librarianValues.profile_image = base64Img.base64Sync(
                librarianValues.profile_image
            );
        } else {
            librarianValues.profile_image = '';
        }
        const librarianSchedule = await getLibrarianSchedule(
            librarianValues.id
        );
        const librarianLoans = await getLibrarianLoans(librarianValues.id);
        const librarianStatistic = await getLibrarianLoanStatistic(librarianLoans);
        const librarianData = {
            id: librarianValues.id,
            name: librarianValues.name,
            email: librarianValues.email,
            profileImage: librarianValues.profile_image,
            department: {address: librarianValues.department_.dataValues.address},
            schedule: librarianSchedule,
            loans: librarianLoans,
            statistic: librarianStatistic
        };
        const data = {
            message: successMessages.SUCCESSFULLY_FETCHED,
            librarian: librarianData
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 400, err);
    }
};
