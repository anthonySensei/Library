const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Genre = require('../models/genre');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getGenres = async (req, res) => {
    try {
        const genres = await Genre.findAll();
        let genresArr = [];
        genres.forEach(genre => {
            genresArr.push({
                id: genre.dataValues.id,
                name: genre.dataValues.name
            });
        });
        const data = {
            genres: genresArr,
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.addGenre = async (req, res) => {
    const genreName = req.body.genre.name;
    try {
        const count = await Genre.count({ where: { name: genreName } });
        if (count > 0) {
            const data = {
                isSuccessful: false,
                message: errorMessages.GENRE_EXIST
            };
            return helper.responseHandle(res, 500, data);
        } else {
            await Genre.create({ name: genreName });
            const data = {
                isSuccessful: true,
                message: successMessages.GENRE_SUCCESSFULLY_CREATED
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

exports.editGenre = async (req, res) => {
    const genreName = req.body.name;
    const genreId = req.body.genreId;
    try {
        const checkName = await Genre.findOne({
            where: { name: genreName, id: { [Op.ne]: genreId } }
        });
        if (checkName) {
            const data = {
                isSuccessful: false,
                message: errorMessages.GENRE_EXIST
            };
            return helper.responseHandle(res, 500, data);
        } else {
            const genre = await Genre.findOne({ where: { id: genreId } });
            await genre.update({ name: genreName });
            const data = {
                isSuccessful: true,
                message: successMessages.GENRE_SUCCESSFULLY_UPDATED
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

exports.deleteGenre = async (req, res) => {
    const genreId = req.query.genreId;
    try {
        const genre = await Genre.findOne({ where: { id: genreId } });
        await genre.destroy();
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
