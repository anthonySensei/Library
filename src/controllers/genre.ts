import { Response, Request } from 'express';

import Genre from '../schemas/genre';
import { GenreSchema } from '../models/genre';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

import { responseErrorHandle, responseSuccessHandle } from '../helper/response';
import logger from '../config/logger';

export const getGenres = async (req: Request, res: Response) => {
    try {
        const genres = await Genre.find() as GenreSchema[];
        const data = { genres: genres.map(genre => genre.toJSON()), message: successMessages.SUCCESSFULLY_FETCHED };
        responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error(`Error fetching genres: ${err.message}`);
        responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

export const addGenre = async (req: Request, res: Response) => {
    const { genre } = req.body;
    const { name } = genre;

    try {
        const isNotUnique = !!(await Genre.findOne({ name }));

        if (isNotUnique) {
            return responseErrorHandle(res, 400, errorMessages.GENRE_EXIST);
        }

        await Genre.create({ name });
        responseSuccessHandle(res, 200, { message: successMessages.GENRE_SUCCESSFULLY_CREATED });
    } catch (err) {
        logger.error(`Error adding genres: ${err.message}`);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const editGenre = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { genre } = req.body;
    const { name } = genre;

    try {
        const isExist = !!(await Genre.findOne({ 'name.en': name.en }));

        if (isExist) {
            return responseErrorHandle(res, 400, errorMessages.GENRE_EXIST);
        }

        await Genre.findByIdAndUpdate(id, { name });
        responseSuccessHandle(res, 200, { message: successMessages.GENRE_SUCCESSFULLY_UPDATED });
    } catch (err) {
        logger.error(`Error editing genres: ${err.message}`);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const deleteGenre = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await Genre.findByIdAndDelete(id);
        responseSuccessHandle(res, 200, { message: successMessages.AUTHOR_SUCCESSFULLY_DELETED });
    } catch (err) {
        logger.error(`Error deleting genres: ${err.message}`);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
