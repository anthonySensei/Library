const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Author = require('../models/author');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getAuthors = async (req, res) => {
    try {
    } catch (error) {
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
    const authors = await Author.findAll();
    const authorsArr = [];
    authors.forEach(author => {
        authorsArr.push({
            id: author.dataValues.id,
            name: author.dataValues.name
        });
    });

    const data = {
        authors: authorsArr,
        message: successMessages.SUCCESSFULLY_FETCHED
    };
    return helper.responseHandle(res, 200, data);
};

exports.addAuthor = async (req, res) => {
    const authorName = req.body.author.name;
    try {
        const count = await Author.count({ where: { name: authorName } });
        if (count > 0) {
            const data = {
                isSuccessful: false,
                message: errorMessages.AUTHOR_EXIST
            };
            return helper.responseHandle(res, 500, data);
        } else {
            await Author.create({ name: authorName });
            const data = {
                isSuccessful: true,
                message: successMessages.AUTHOR_SUCCESSFULLY_CREATED
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

exports.editAuthor = async (req, res) => {
    const authorName = req.body.name;
    const authorId = req.body.authorId;
    try {
        const checkName = await Author.findOne({
            where: {
                name: authorName,
                id: { [Op.ne]: authorId }
            }
        });
        if (checkName) {
            const data = {
                isSuccessful: false,
                message: errorMessages.AUTHOR_EXIST
            };
            return helper.responseHandle(res, 500, data);
        } else {
            const author = await Author.findOne({ where: { id: authorId } });
            await author.update({ name: authorName });
            const data = {
                isSuccessful: true,
                message: successMessages.AUTHOR_SUCCESSFULLY_UPDATED
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
    } catch (error) {
        const data = {
            isSuccessful: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 500, data);
    }
};
