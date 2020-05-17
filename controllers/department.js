const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Department = require('../models/department');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getDepartments = (req, res) => {
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

exports.addDepartment = async (req, res) => {
    const departmentAddress = req.body.department.address;
    try {
        const checkAddress = await Department.findOne({
            where: { address: departmentAddress }
        });
        if (checkAddress) {
            const data = {
                isSuccessful: false,
                message: errorMessages.DEPARTMENTS_EXIST
            };
            return helper.responseHandle(res, 500, data);
        } else {
            await Department.create({ address: departmentAddress });
            const data = {
                isSuccessful: true,
                message: successMessages.DEPARTMENT_SUCCESSFULLY_CREATED
            };
            return helper.responseHandle(res, 200, data);
        }
    } catch (error) {
        console.log(error);
        const data = {
            isSuccessful: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 500, data);
    }
};

exports.editDepartment = async (req, res) => {
    const departmentAddress = req.body.address;
    const departmentId = req.body.departmentId;
    try {
        const checkAddress = await Department.findOne({
            where: {
                address: departmentAddress,
                id: { [Op.ne]: departmentId }
            }
        });
        if (checkAddress) {
            const data = {
                isSuccessful: false,
                message: errorMessages.DEPARTMENTS_EXIST
            };
            return helper.responseHandle(res, 400, data);
        } else {
            const department = await Department.findOne({
                where: { id: departmentId }
            });
            await department.update({ address: departmentAddress });
            const data = {
                isSuccessful: true,
                message: successMessages.DEPARTMENT_SUCCESSFULLY_UPDATED
            };
            return helper.responseHandle(res, 200, data);
        }
    } catch (error) {
        const data = {
            isSuccessful: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 500, data);
    }
};

exports.deleteDepartment = async (req, res) => {
    const departmentId = req.query.departmentId;
    try {
        const department = await Department.findOne({
            where: { id: departmentId }
        });
        await department.destroy();
        const data = {
            isSuccessful: true,
            message: successMessages.DEPARTMENT_SUCCESSFULLY_DELETED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        const data = {
            isSuccessful: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 500, data);
    }
};
