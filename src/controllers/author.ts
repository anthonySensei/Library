import { Request, Response } from 'express';

import logger from '../config/logger';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

import { AuthorSchema } from '../models/author';
import Author from '../schemas/author';

import { responseErrorHandle, responseSuccessHandle } from '../helper/response';

export const getAuthors = async (req: Request, res: Response) => {
    try {
        const authors = await Author.find() as AuthorSchema[];
        const data = { authors: authors.map(author => author.toJSON()), message: successMessages.SUCCESSFULLY_FETCHED };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        console.error(`Error fetching authors`, err.message);
        return responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

export const addAuthor = async (req: Request, res: Response) => {
    const { author } = req.body;

    try {
        const isNotUnique = !!(await Author.findOne({ name: author.name }));

        if (isNotUnique) {
            return responseErrorHandle(res, 400, errorMessages.AUTHOR_EXIST);
        }

        await Author.create(author);
        responseSuccessHandle(res, 200, { message: successMessages.AUTHOR_SUCCESSFULLY_CREATED });
    } catch (err) {
        logger.error(`Error creating author`, err.message);
        responseErrorHandle( res, 500, errorMessages.SOMETHING_WENT_WRONG );
    }
};

export const editAuthor = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { author } = req.body;

    try {
        const isExist = !!(await Author.findOne({ name: author.name, _id: { $ne: id } }));

        if (isExist) {
            return responseErrorHandle(res, 400, errorMessages.AUTHOR_EXIST);
        }

        await Author.findByIdAndUpdate(id, author);
        responseSuccessHandle(res, 200, { message: successMessages.AUTHOR_SUCCESSFULLY_UPDATED });
    } catch (err) {
        logger.error(`Error creating author`, err.message);
        responseErrorHandle( res, 500, errorMessages.SOMETHING_WENT_WRONG );
    }
};

export const deleteAuthor = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await Author.findByIdAndDelete(id);
        responseSuccessHandle(res, 200, { message: successMessages.AUTHOR_SUCCESSFULLY_DELETED });
    } catch (err) {
        responseErrorHandle( res, 500, errorMessages.SOMETHING_WENT_WRONG );
    }
};
