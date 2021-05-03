import { Request, Response } from 'express';
import { responseErrorHandle, responseSuccessHandle } from '../helper/responseHandle';

import { convertToBase64, getImagePath } from '../helper/image';

const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Book = require('../schemas/book');
const Genre = require('../schemas/genre');
const Author = require('../schemas/author');
const Department = require('../schemas/department');

const successMessages = require('../constants/successMessages');
const errorMessages = require('../constants/errorMessages');

exports.getBooks = async (req: Request, res: Response) => {
    // const page = +req.query.page || 1;
    // const fromYear = +req.query.yFrom;
    // const toYear = +req.query.yTo;
    // const author = +req.query.author;
    // const genre = +req.query.genre;
    // const department = +req.query.department;
    // const filterName = req.query.filterName;
    // const filterValue = req.query.filterValue;

    try {
        // const totalBooks = await Book.count({ where: condition });
        // const books = await Book.findAll({
        //     include: [
        //         { model: Department },
        //         { model: Author },
        //         { model: Genre }
        //     ],
        //     order: [['year', 'DESC']],
        //     where: condition,
        //     limit: ITEMS_PER_PAGE,
        //     offset: (page - 1) * ITEMS_PER_PAGE
        // });
        // const booksArr = [];
        // books.forEach(book => {
        //     const bookValues = book.get();
        //     bookValues.image = convertToBase64(bookValues.image);
        //     booksArr.push({
        //         id: bookValues.id,
        //         name: bookValues.name,
        //         year: bookValues.year,
        //         author: bookValues.author_.get(),
        //         genre: bookValues.genre_.get(),
        //         image: bookValues.image,
        //         description: bookValues.description,
        //         department: bookValues.department_.get()
        //     });
        // });
        const totalPages = 12;
        const page = 1;
        const data = {
            books: [],
            message: successMessages.SUCCESSFULLY_FETCHED,
            paginationData: {
                currentPage: page,
                hasNextPage: totalPages * page < 0,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(0 / totalPages)
            }
        };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.getBook = async (req: Request, res: Response) => {
    const bookId = req.query.bookId;
    const condition: any = { id: bookId };

    if (!bookId) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        const book = await Book.findOne({ where: condition, include: [{ model: Author }, { model: Genre }] });
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

exports.getAllBooksISBN = async (req: Request, res: Response) => {
    try {
        const books = await Book.findAll();
        const booksArr: any = [];
        books.forEach((book: any) => {
            const bookData = book.get();
            booksArr.push({
                id: bookData.id,
                isbn: bookData.isbn,
                department: { id: bookData.departmentId }
            });
        });
        const data = { books: booksArr, message: successMessages.SUCCESSFULLY_FETCHED };
        responseSuccessHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.addBook = async (req: Request, res: Response) => {
    const imageBase64 = req.body.base64;
    const bookData = JSON.parse(req.body.book_data);

    if (!imageBase64) { return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS); }
    if (!bookData) { return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS); }

    const filepath = getImagePath(imageBase64);

    try {
        const isNotUnique = await Book.findOne({ where: {
                isbn: bookData.isbn,
                departmentId: bookData.department.id
            }
        });

        if (isNotUnique) {
            return responseErrorHandle(res, 400, errorMessages.ISBN_EXIST);
        } else {
            const newBook = new Book({
                isbn: bookData.isbn,
                name: bookData.name,
                authorId: bookData.author.id,
                genreId: bookData.genre.id,
                year: bookData.year,
                quantity: bookData.quantity,
                description: bookData.description,
                image: filepath,
                departmentId: bookData.department.id
            });

            await newBook.save();

            const data = { isSuccessful: true, message: successMessages.BOOK_SUCCESSFULLY_CREATED };
            return responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.editBook = async (req: Request, res: Response) => {
    const imageBase64 = JSON.parse(req.body.base64);
    const bookData = JSON.parse(req.body.book_data);

    if (!bookData && !imageBase64) { return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS); }

    imageBase64.image ?
        bookData.image = getImagePath(imageBase64.image) :
        bookData.image = getImagePath(bookData.image);

    try {
        const isNotUnique = await Book.findOne({
            where: {
                isbn: bookData.isbn,
                departmentId: bookData.department.id,
                id: { [Op.ne]: bookData.id }
            }
        });

        if (isNotUnique) {
            return responseErrorHandle(res, 400, errorMessages.ISBN_EXIST);
        } else {
            const book = await Book.findOne({ where: { id: bookData.id } });
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
        const book = await Book.findOne({ where: { id: bookId } });
        await book.destroy();
        const data = { isSuccessful: true, message: successMessages.BOOK_SUCCESSFULLY_DELETED };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.moveBook = async (req: Request, res: Response) => {
    const departmentId = req.body.departmentId;
    const quantity = req.body.quantity;
    const book = req.body.book;
    const newBook = {
        ...book,
        departmentId,
        id: null,
        genreId: book.genre.id,
        authorId: book.author.id,
        quantity
    };
    try {
        newBook.image = getImagePath(newBook.image);
        const isNotUnique = await Book.findOne({
            where: {
                isbn: newBook.isbn,
                departmentId: newBook.departmentId
            }
        });

        if (isNotUnique) {
            await isNotUnique.update({ quantity: isNotUnique.get().quantity + quantity });
            // tslint:disable-next-line:no-shadowed-variable
            const bookInDb: any = await Book.findOne({ where: { id: book.id } });
            await bookInDb.update({ quantity: bookInDb.get().quantity - quantity });
            // tslint:disable-next-line:no-shadowed-variable
            const data: any = { isSuccessful: true, message: successMessages.BOOK_SUCCESSFULLY_MOVED };
            return responseSuccessHandle(res, 200, data);
        }

        await Book.create(newBook);
        const bookInDb = await Book.findOne({ where: { id: book.id } });
        await bookInDb.update({ quantity: bookInDb.get().quantity - quantity });
        const data = { isSuccessful: true, message: successMessages.BOOK_SUCCESSFULLY_MOVED };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
