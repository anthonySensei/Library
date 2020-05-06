const Student = require('../models/student');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');


exports.getStudents = (req, res) => {
    Student.findAll()
        .then(students => {
            const studentsArr = [];
            students.forEach(student => {
                if (student.dataValues.profile_image) {
                    student.dataValues.profile_image = base64Img.base64Sync(
                        student.dataValues.profile_image
                    );
                } else {
                    student.dataValues.profile_image = '';
                }
                const studentData = {
                    id: student.dataValues.id,
                    name: student.dataValues.name,
                    email: student.dataValues.email,
                    profileImage: student.dataValues.profile_image,
                    readerTicket: student.dataValues.reader_ticket,
                    status: student.dataValues.status
                };
                studentsArr.push(studentData);
            });
            const data = {
                message: successMessages.SUCCESSFULLY_FETCHED,
                students: studentsArr
            };
            return helper.responseHandle(res, 200, data);
        })
        .catch(err => {
            return helper.responseErrorHandle(res, 400, err);
        });
};

exports.getStudent = (req, res) => {
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
