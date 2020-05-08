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
