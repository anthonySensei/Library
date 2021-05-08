import { Request, Response } from 'express';

import Department from '../schemas/department';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

import { responseErrorHandle, responseSuccessHandle } from '../helper/responseHandle';
import { DepartmentSchema } from '../models/department';

export const getDepartments = async (req: Request, res: Response) => {
    try {
        const departments = await Department.find() as DepartmentSchema[];
        const data = {
            departments: departments.map(department => ({ id: department.id, name: department.name, address: department.address })),
            message: successMessages.SUCCESSFULLY_FETCHED,
        };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

export const createDepartment = async (req: Request, res: Response) => {
    const { department } = req.body;

    try {
        const isExist = !!(await Department.findOne({ name: department.name }));

        if (isExist) {
            return responseErrorHandle(res, 400, errorMessages.DEPARTMENTS_EXIST);
        }

        await Department.create(department);
        return responseSuccessHandle(res, 200, { message: successMessages.DEPARTMENT_SUCCESSFULLY_CREATED });
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const editDepartment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { department } = req.body;

    try {
        const isExist = !!(await Department.findOne({ _id: { $ne: id }, name: department.name }));

        if (isExist) {
            return responseErrorHandle(res, 400, errorMessages.DEPARTMENTS_EXIST);
        }

        await Department.findByIdAndUpdate(id, department);
        responseSuccessHandle(res, 200,  { message: successMessages.DEPARTMENT_SUCCESSFULLY_UPDATED });
    } catch (err) {
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const deleteDepartment = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await Department.findByIdAndDelete(id);
        return responseSuccessHandle(res, 200, { message: successMessages.DEPARTMENT_SUCCESSFULLY_DELETED });
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
