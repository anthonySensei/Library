const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Period = require('../schemas/period');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getPeriods = async (req, res) => {
    try {
        const periods = await Period.findAll();
        let periodsArr = [];
        periods.forEach(period => {
            periodsArr.push({
                id: period.get().id,
                start: period.get().start,
                end: period.get().end
            });
        });
        const data = {
            periods: periodsArr,
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        return helper.responseSuccessHandle(res, 200, data);
    } catch (error) {
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.addPeriod = async (req, res) => {
    const periodStart = req.body.period.start;
    const periodEnd = req.body.period.end;
    try {
        const isNotUnique = await Period.findOne({
            where: { start: periodStart, end: periodEnd }
        });
        if (isNotUnique) {
            return helper.responseErrorHandle(
                res,
                500,
                errorMessages.PERIOD_EXIST
            );
        } else {
            await Period.create({
                start: periodStart,
                end: periodEnd
            });
            const data = {
                isSuccessful: true,
                message: successMessages.PERIOD_SUCCESSFULLY_CREATED
            };
            return helper.responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.editPeriod = async (req, res) => {
    const periodId = req.body.period.id;
    const periodStart = req.body.period.start;
    const periodEnd = req.body.period.end;
    try {
        const checkUniqueness = await Period.findOne({
            where: {
                start: periodStart,
                end: periodEnd,
                id: { [Op.ne]: periodId }
            }
        });
        if (checkUniqueness) {
            return helper.responseErrorHandle(
                res,
                500,
                errorMessages.PERIOD_EXIST
            );
        } else {
            const period = await Period.findOne({ where: { id: periodId } });
            await period.update({
                start: periodStart,
                end: periodEnd
            });
            const data = {
                isSuccessful: true,
                message: successMessages.PERIOD_SUCCESSFULLY_UPDATED
            };
            return helper.responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.deletePeriod = async (req, res) => {
    const periodId = req.query.periodId;
    try {
        const period = await Period.findOne({ where: { id: periodId } });
        await period.destroy();
        const data = {
            isSuccessful: true,
            message: successMessages.PERIOD_SUCCESSFULLY_DELETED
        };
        return helper.responseSuccessHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
