const Department = require('../models/department');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getDepartmentsForSelect = (req, res) => {
    Department.findAll()
        .then(result => {
            let departments = [];

            for (let department of result) {
                departments.push({
                    id: department.dataValues.id,
                    address: department.dataValues.address
                });
            }
            const data = {
                departments: departments,
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
