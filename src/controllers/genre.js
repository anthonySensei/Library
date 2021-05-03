const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Genre = require('../schemas/sgenre');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getGenres = async (req, res) => {
    try {
        const genres = await Genre.findAll();
        let genresArr = [];
        genres.forEach(genre => genresArr.push({ id: genre.get().id, name: genre.get().name }));
        const data = { genres: genresArr, message: successMessages.SUCCESSFULLY_FETCHED };
        return helper.responseSuccessHandle(res, 200, data);
    } catch (error) {
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.addGenre = async (req, res) => {
    const genreName = req.body.genre.name;
    try {
        const isNotUnique = await Genre.findOne({ where: { name: genreName } });
        if (isNotUnique) {
            return helper.responseErrorHandle(res, 500, errorMessages.GENRE_EXIST);
        } else {
            await Genre.create({ name: genreName });
            const data = { isSuccessful: true, message: successMessages.GENRE_SUCCESSFULLY_CREATED};
            return helper.responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.editGenre = async (req, res) => {
    const genreName = req.body.name;
    const genreId = req.body.genreId;
    try {
        const isNotUnique = await Genre.findOne({ where: { name: genreName, id: { [Op.ne]: genreId } }});
        if (isNotUnique) {
            return helper.responseErrorHandle(res, 500, errorMessages.GENRE_EXIST);
        } else {
            const genre = await Genre.findOne({ where: { id: genreId } });
            await genre.update({ name: genreName });
            const data = { isSuccessful: true,message: successMessages.GENRE_SUCCESSFULLY_UPDATED};
            return helper.responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.deleteGenre = async (req, res) => {
    const genreId = req.query.genreId;
    try {
        const genre = await Genre.findOne({ where: { id: genreId } });
        await genre.destroy();
        const data = { isSuccessful: true, message: successMessages.DEPARTMENT_SUCCESSFULLY_DELETED };
        return helper.responseSuccessHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
