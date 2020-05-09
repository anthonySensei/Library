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
        await Author.create({ name: authorName });
        const data = {
            isCreated: true,
            message: successMessages.AUTHOR_SUCCESSFULLY_CREATED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        const data = {
            isCreated: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 500, data);
    }
};
