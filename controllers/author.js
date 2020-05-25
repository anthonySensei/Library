const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Author = require('../models/author');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getAuthors = async (req, res) => {
    try {
        const authors = await Author.findAll();
        const authorsArr = [];
        authors.forEach(author => {
            authorsArr.push({
                id: author.get().id,
                name: author.get().name
            });
        });
        const data = {
            authors: authorsArr,
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.addAuthor = async (req, res) => {
    const authorName = req.body.author.name;
    try {
        const isNotUnique = await Author.findOne({
            where: { name: authorName }
        });
        if (isNotUnique) {
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.AUTHOR_EXIST
            );
        } else {
            await Author.create({ name: authorName });
            const data = {
                isSuccessful: true,
                message: successMessages.AUTHOR_SUCCESSFULLY_CREATED
            };
            return helper.responseHandle(res, 200, data);
        }
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.editAuthor = async (req, res) => {
    const authorName = req.body.name;
    const authorId = req.body.authorId;
    try {
        const isNotUnique = await Author.findOne({
            where: {
                name: authorName,
                id: { [Op.ne]: authorId }
            }
        });
        if (isNotUnique) {
            return helper.responseErrorHandle(
                res,
                500,
                errorMessages.AUTHOR_EXIST
            );
        } else {
            const author = await Author.findOne({ where: { id: authorId } });
            await author.update({ name: authorName });
            const data = {
                isSuccessful: true,
                message: successMessages.AUTHOR_SUCCESSFULLY_UPDATED
            };
            return helper.responseHandle(res, 200, data);
        }
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.deleteAuthor = async (req, res) => {
    const authorId = req.query.authorId;
    try {
        const author = await Author.findOne({ where: { id: authorId } });
        await author.destroy();
        const data = {
            isSuccessful: true,
            message: successMessages.AUTHOR_SUCCESSFULLY_DELETED
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
