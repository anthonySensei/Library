const Librarian = require('../models/librarian');
const Department = require('../models/department');
const Role = require('../models/role');
const Schedule = require('../models/schedule');

const roles = require('../constants/roles');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getLibrarians = (req, res) => {
    Librarian.findAll({ include: [{ model: Department }] })
        .then(librarians => {
            const librariansArr = [];
            librarians.forEach(librarian => {
                const librarianValues = librarian.dataValues;
                Role.findOne({
                    where: {
                        user_id: librarianValues.id
                    }
                })
                    .then(role => {
                        if (role.dataValues.role === roles.LIBRARIAN) {
                            if (librarianValues.profile_image) {
                                librarianValues.profile_image = base64Img.base64Sync(
                                    librarianValues.profile_image
                                );
                            } else {
                                librarianValues.profile_image = '';
                            }
                            const librarianData = {
                                id: librarianValues.id,
                                name: librarianValues.name,
                                email: librarianValues.email,
                                profileImage: librarianValues.profile_image,
                                department: {
                                    address:
                                        librarianValues.department_.dataValues
                                            .address
                                }
                            };
                            librariansArr.push(librarianData);
                        }
                    })
                    .catch();
            });
            console.log(librariansArr);

            const data = {
                message: successMessages.SUCCESSFULLY_FETCHED,
                librarians: librariansArr
            };
            return helper.responseHandle(res, 200, data);
        })
        .catch(err => {
            return helper.responseErrorHandle(res, 400, err);
        });
};

exports.getLibrarian = (req, res) => {
    const studentId = req.query.studentId;
    Student.findOne({
        where: {
            id: studentId
        }
    })
        .then(student => {
            const studentData = {
                name: student.dataValues.name,
                email: student.dataValues.email,
                profileImage: student.dataValues.profile_image,
                readerTicket: student.dataValues.reader_ticket,
                status: student.dataValues.status
            };
            const data = {
                message: successMessages.SUCCESSFULLY_FETCHED,
                student: studentData
            };
            return helper.responseHandle(res, 200, data);
        })
        .catch(err => {
            return helper.responseErrorHandle(res, 400, err);
        });
};
