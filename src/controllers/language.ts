import { Request, Response } from 'express';

import logger from '../config/logger';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

import { LanguageSchema } from '../models/language';
import Language from '../schemas/language';

import { responseErrorHandle, responseSuccessHandle } from '../helper/responseHandle';

export const getLanguages = async (req: Request, res: Response) => {
    try {
        const languages = await Language.find() as LanguageSchema[];
        const data = {
            languages: languages.map(language => ({
                id: language._id, englishTitle: language.englishTitle, code: language.code
            })),
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        console.error(`Error fetching languages`, err.message);
        return responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

export const addALanguage = async (req: Request, res: Response) => {
    const { language } = req.body;

    try {
        const isNotUnique = !!(await Language.findOne({ code: language.code }));

        if (isNotUnique) {
            return responseErrorHandle(res, 400, errorMessages.LANGUAGE_EXIST);
        }

        await Language.create(language);
        responseSuccessHandle(res, 200, { message: successMessages.LANGUAGE_SUCCESSFULLY_CREATED });
    } catch (err) {
        logger.error(`Error creating language`, err.message);
        responseErrorHandle( res, 500, errorMessages.SOMETHING_WENT_WRONG );
    }
};

export const editLanguage = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { language } = req.body;

    try {
        const isExist = !!(await Language.findOne({ code: language.code, _id: { $ne: id } }));

        if (isExist) {
            return responseErrorHandle(res, 400, errorMessages.LANGUAGE_EXIST);
        }

        await Language.findByIdAndUpdate(id, language);
        const data = { message: successMessages.LANGUAGE_SUCCESSFULLY_UPDATED };
        responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error(`Error updating language`, err.message);
        responseErrorHandle( res, 500, errorMessages.SOMETHING_WENT_WRONG );
    }
};

export const deleteLanguage = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await Language.findByIdAndDelete(id);
        const data = { message: successMessages.LANGUAGE_SUCCESSFULLY_DELETED };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error(`Error deleting language`, err.message);
        return responseErrorHandle( res, 500, errorMessages.SOMETHING_WENT_WRONG );
    }
};
