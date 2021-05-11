import { Request, Response } from 'express';

import Book from '../schemas/book';
import { BookSchema } from '../models/book';

import { responseErrorHandle, responseSuccessHandle } from '../helper/responseHandle';
import { convertToBase64, getImagePath } from '../helper/image';
import { removedEmptyFields } from '../helper/object';

import logger from '../config/logger';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const SequliezeBook = require('../schemas/sbook');
const Genre = require('../schemas/sgenre');
const Author = require('../schemas/sauthor');
const Department = require('../schemas/sdepartment');

exports.getBooks = async (req: Request, res: Response) => {
    const { filterValue, yFrom, yTo, pageSize } = req.query;
    const page = Number(req.query.page);
    const authors = String(req.query.authors).split(',');
    const genres = String(req.query.authors).split(',');

    const regex = new RegExp(filterValue as string, 'i');
    const filterCondition: any = {
        quantity: { $gt: 0 },
        $and: [ { $or: [{title: regex }, { isbn: regex }, { description: regex } ] } ]
    };
    const filter: any = removedEmptyFields(filterCondition);
    authors.forEach(author => filter.$and = filter.$and.concat(removedEmptyFields({ 'authors.author': author })));
    genres.forEach(genre => filter.$and = filter.$and.concat(removedEmptyFields({ 'genres.genre': genre })));

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
            title: book.title,
            authors: book.authors.map(author => author.author),
            genres: book.genres.map(genre => genre.genre),
            year: book.year,
            image: convertToBase64(book.image)
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

exports.getBook = async (req: Request, res: Response) => {
    const bookId = req.query.bookId;
    const condition: any = { id: bookId };

    if (!bookId) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        const book = await SequliezeBook.findOne({ where: condition, include: [{ model: Author }, { model: Genre }] });
        const bookValues = book.get();
        const department = await Department.findOne({ where: { id: book.get().departmentId } });
        bookValues.image = convertToBase64(bookValues.image);
        const bookData = {
            id: bookValues.id,
            isbn: bookValues.isbn,
            quantity: bookValues.quantity,
            name: bookValues.name,
            author: bookValues.author_.get(),
            genre: bookValues.genre_.get(),
            image: bookValues.image,
            description: bookValues.description,
            year: bookValues.year,
            department: department.get()
        };
        const data = { book: bookData, message: successMessages.SUCCESSFULLY_FETCHED };
        responseSuccessHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.addBook = async (req: Request, res: Response) => {
    const book = JSON.parse(req.body.book);

    if (!book) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    book.image = getImagePath(book.image);

    try {
        const isExists = await Book.findOne({ isbn: book.isbn });

        if (isExists) {
            return responseErrorHandle(res, 400, errorMessages.ISBN_EXIST);
        }

        book.department = book.department.id;
        book.genres = book.genres.map((genre: any) => ({ genre: genre.id }));
        book.authors = book.authors.map((author: any) => ({ author: author.id }));
        await Book.create(book);
        responseSuccessHandle(res, 200, { message: successMessages.BOOK_SUCCESSFULLY_CREATED });
    } catch (err) {
        logger.error('Error creating book', err.message);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.editBook = async (req: Request, res: Response) => {
    const imageBase64 = JSON.parse(req.body.base64);
    const bookData = JSON.parse(req.body.book_data);

    if (!bookData && !imageBase64) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    imageBase64.image ?
        bookData.image = getImagePath(imageBase64.image) :
        bookData.image = getImagePath(bookData.image);

    try {
        const isNotUnique = await SequliezeBook.findOne({
            where: {
                isbn: bookData.isbn,
                departmentId: bookData.department.id,
                id: { [Op.ne]: bookData.id }
            }
        });

        if (isNotUnique) {
            return responseErrorHandle(res, 400, errorMessages.ISBN_EXIST);
        } else {
            const book = await SequliezeBook.findOne({ where: { id: bookData.id } });
            await book.update(bookData);
            const data = { isSuccessful: true, message: successMessages.BOOK_SUCCESSFULLY_UPDATED };
            return responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.deleteBook = async (req: Request, res: Response) => {
    const bookId = req.query.bookId;
    try {
        const book = await SequliezeBook.findOne({ where: { id: bookId } });
        await book.destroy();
        const data = { isSuccessful: true, message: successMessages.BOOK_SUCCESSFULLY_DELETED };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
