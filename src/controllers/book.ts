import { Request, Response } from 'express';
import moment from 'moment';

import Book from '../schemas/book';
import Loan from '../schemas/loan';

import { BookSchema } from '../models/book';

import { responseErrorHandle, responseSuccessHandle } from '../helper/response';
import { removedEmptyFields } from '../helper/object';
import {uploadFileToStorage, uploadImageToStorage} from '../helper/storage';

import logger from '../config/logger';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

export const getBooks = async (req: Request, res: Response) => {
    const { filterValue, yFrom, yTo, pageSize, language } = req.query;
    const page = Number(req.query.page);
    const authors = String(req.query.authors).split(',');
    const genres = String(req.query.genres).split(',');
    const onlyEbooks = !!req.query.onlyEbooks;
    const onlyNormalBooks = !!req.query.onlyNormalBooks;

    const regex = new RegExp(filterValue as string, 'i');
    const filterCondition: any = {
        quantity: { $gt: 0 },
        $and: [ { $or: [{title: regex }, { isbn: regex }, { description: regex } ] } ]
    };
    const filter: any = removedEmptyFields(filterCondition);
    authors.forEach(author => filter.$and = filter.$and.concat(removedEmptyFields({ 'authors.author': author })));
    genres.forEach(genre => filter.$and = filter.$and.concat(removedEmptyFields({ 'genres.genre': genre })));

    if (language) {
        filter.$and = filter.$and.concat({ language });
    }

    if (onlyEbooks || onlyNormalBooks) {
        filter.$and = filter.$and.concat({ ebook: onlyEbooks || { $ne: true } });
    }

    if (yFrom || yTo) {
        filter.year = {
            $gt: Number(yFrom) - 1 || 0,
            $lt: Number(yTo) + 1 || new Date().getFullYear() + 1,
        };
    }

    try {
        const length = await Book.countDocuments(filter);
        const books = await Book
            .find(filter, {}, {
                limit: Number(pageSize),
                skip: Number(page) * Number(pageSize),
                sort: { year: -1 }
            })
            .populate('authors.author')
            .populate('genres.genre') as BookSchema[];
        const booksData = books.map(book => ({
            ...book.toJSON(),
            authors: book.authors.map(author => author.author),
            genres: book.genres.map(genre => genre.genre),
        }));
        const data = {
            books: booksData,
            message: successMessages.SUCCESSFULLY_FETCHED,
            pagination: { page, length }
        };
        responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error(`Error fetching books: ${err.message}`);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const getBook = async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        const book = await Book.findById(id).populate('authors.author').populate('genres.genre') as BookSchema;
        const bookData = {
            ...book.toJSON(),
            authors: book.authors.map(author => author.author),
            genres: book.genres.map(genre => genre.genre),
        };
        responseSuccessHandle(res, 200, { book: bookData, message: successMessages.SUCCESSFULLY_FETCHED });
    } catch (err) {
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const getBookStats = async (req: Request, res: Response) => {
    const id = req.params.id;
    const monthAgo = moment().subtract('1', 'months').toDate();

    try {
        const loansAllTime = await Loan.countDocuments({ book: id });
        const loansForLastMonth = await Loan.countDocuments({  loanedAt: { $gt: monthAgo }, book: id });
        const notReturnedBooks = await Loan.countDocuments({ book: id, returnedAt: { $exists: false } });
        const bookStats = { loansForLastMonth, loansAllTime, notReturnedBooks };
        responseSuccessHandle(res, 200, { bookStats, message: successMessages.SUCCESSFULLY_FETCHED });
    } catch (err) {
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const addBook = async (req: Request, res: Response) => {
    const book = JSON.parse(req.body.book);
    const file = req.file;

    if (!book) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    try {
        const isExists = await Book.findOne({ isbn: book.isbn });

        if (isExists) {
            return responseErrorHandle(res, 400, errorMessages.ISBN_EXIST);
        }

        if (book.ebook) {
            book.file = await uploadFileToStorage(file.path);
        }

        book.image = await uploadImageToStorage(book.image);
        book.genres = book.genres.map((genre: any) => ({ genre: genre.id }));
        book.authors = book.authors.map((author: any) => ({ author: author.id }));
        await Book.create(book);
        responseSuccessHandle(res, 200, { message: successMessages.BOOK_SUCCESSFULLY_CREATED });
    } catch (err) {
        logger.error('Error creating book', err.message);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const editBook = async (req: Request, res: Response) => {
    const id = req.params.id;
    const book = JSON.parse(req.body.book);

    if (!book) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    try {
        const isExists = await Book.findOne({ _id: { $ne: id }, isbn: book.isbn });

        if (isExists) {
            return responseErrorHandle(res, 400, errorMessages.ISBN_EXIST);
        }

        book.genres = book.genres.map((genre: any) => ({ genre: genre.id }));
        book.authors = book.authors.map((author: any) => ({ author: author.id }));
        await Book.findByIdAndUpdate(id, book);
        responseSuccessHandle(res, 200, { message: successMessages.BOOK_SUCCESSFULLY_UPDATED });
    } catch (err) {
        logger.error(`Error updating book`, err.message);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const deleteBook = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await Book.findByIdAndDelete(id);
        responseSuccessHandle(res, 200, { message: successMessages.BOOK_SUCCESSFULLY_DELETED });
    } catch (err) {
        logger.error(`Error deleting book: ${err.message}`);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
