const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Department = require('../models/department');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll();
        const departmentsArr = [];

        for (let department of departments) {
            departmentsArr.push({ id: department.get().id, address: department.get().address });
        }
        const data = { departments: departmentsArr, message: successMessages.SUCCESSFULLY_FETCHED };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.addDepartment = async (req, res) => {
    const departmentAddress = req.body.department.address;
    try {
        const isNotUnique = await Department.findOne({ where: { address: departmentAddress } });
        if (isNotUnique) {
            return helper.responseErrorHandle(res, 400, errorMessages.DEPARTMENTS_EXIST);
        } else {
            await Department.create({ address: departmentAddress });
            const data = { isSuccessful: true, message: successMessages.DEPARTMENT_SUCCESSFULLY_CREATED };
            return helper.responseHandle(res, 200, data);
        }
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.editDepartment = async (req, res) => {
    const departmentAddress = req.body.address;
    const departmentId = req.body.departmentId;
    try {
        const isNotUnique = await Department.findOne({
            where: { address: departmentAddress, id: { [Op.ne]: departmentId } }
        });
        if (isNotUnique) {
            return helper.responseErrorHandle(res, 400, errorMessages.DEPARTMENTS_EXIST);
        } else {
            const department = await Department.findOne({ where: { id: departmentId } });
            await department.update({ address: departmentAddress });
            const data = { isSuccessful: true, message: successMessages.DEPARTMENT_SUCCESSFULLY_UPDATED };
            return helper.responseHandle(res, 200, data);
        }
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.deleteDepartment = async (req, res) => {
    const departmentId = req.query.departmentId;
    try {
        const department = await Department.findOne({ where: { id: departmentId } });
        await department.destroy();
        const data = { isSuccessful: true, message: successMessages.DEPARTMENT_SUCCESSFULLY_DELETED };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
