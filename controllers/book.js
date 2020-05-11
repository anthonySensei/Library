const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Book = require('../models/book');
const Genre = require('../models/genre');
const Author = require('../models/author');
const Department = require('../models/department');

const uuidv4 = require('uuid/v4');

const base64Img = require('base64-img');

const statuses = require('../constants/statuses');
const filters = require('../constants/filters');
const successMessages = require('../constants/successMessages');
const errorMessages = require('../constants/errorMessages');

const ITEMS_PER_PAGE = 8;

const helper = require('../helper/responseHandle');

const getCondition = (
    filterName,
    filterValue,
    author,
    genre,
    department,
    toYear,
    fromYear
) => {
    let authorCondition = {};
    let genreCondition = {};
    let departmentCondition = {};
    let yearCondition = {};
    let filterCondition = {};

    if (filterName && filterValue) {
        if (filterName === filters.TITLE)
            filterCondition = { name: { [Op.iLike]: `%${filterValue}%` } };
        else if (filterName === filters.ISBN)
            filterCondition = { isbn: filterValue };
    }

    if (author) authorCondition = { authorId: author };
    if (genre) authorCondition = { genreId: genre };
    if (department) departmentCondition = { departmentId: department };

    if (toYear && fromYear)
        yearCondition = { year: { [Op.between]: [fromYear, toYear] } };
    else if (fromYear) yearCondition = { year: { [Op.gte]: fromYear } };
    else if (toYear) yearCondition = { year: { [Op.lte]: toYear } };

    return {
        ...authorCondition,
        ...genreCondition,
        ...departmentCondition,
        ...yearCondition,
        ...filterCondition
    };
};

exports.getAllBooks = async (req, res) => {
    const page = +req.query.page || 1;
    const fromYear = +req.query.yFrom;
    const toYear = +req.query.yTo;
    const author = +req.query.author;
    const genre = +req.query.genre;
    const department = +req.query.department;
    const filterName = req.query.filterName;
    const filterValue = req.query.filterValue;

    const condition = getCondition(
        filterName,
        filterValue,
        author,
        genre,
        department,
        toYear,
        fromYear
    );

    try {
        const totalBooks = await Book.count({
            include: {
                model: Department
            }
        });
        const books = await Book.findAll({
            include: [
                {
                    model: Department
                },
                {
                    model: Author
                },
                { model: Genre }
            ],
            where: condition,
            limit: ITEMS_PER_PAGE,
            offset: (page - 1) * ITEMS_PER_PAGE
        });
        const booksArr = [];
        books.forEach(book => {
            const bookValues = book.dataValues;
            bookValues.image = base64Img.base64Sync(bookValues.image);
            if (bookValues.quantity > 0)
                booksArr.push({
                    bookId: bookValues.id,
                    name: bookValues.name,
                    year: bookValues.year,
                    author: bookValues.author_.dataValues,
                    genre: bookValues.genre_.dataValues,
                    image: bookValues.image,
                    description: bookValues.description,
                    status: bookValues.status,
                    department: bookValues.department_.dataValues
                });
        });
        const data = {
            books: booksArr,
            message: successMessages.SUCCESSFULLY_FETCHED,
            paginationData: {
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalBooks,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalBooks / ITEMS_PER_PAGE)
            }
        };

        return helper.responseHandle(res, 200, data);
    } catch (error) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.getBook = async (req, res) => {
    const bookId = req.query.bookId;
    let condition = { id: bookId };

    if (!bookId) {
        return helper.responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }

    try {
        const book = await Book.findOne({
            where: condition,
            include: [{ model: Author }, { model: Genre }]
        });
        const bookValues = book.dataValues;
        const department = await Department.findOne({
            where: { id: book.dataValues.departmentId }
        });
        book.dataValues.image = base64Img.base64Sync(book.dataValues.image);

        const bookData = {
            bookId: bookValues.id,
            name: bookValues.name,
            author: bookValues.author_.dataValues,
            genre: bookValues.genre_.dataValues,
            image: bookValues.image,
            status: bookValues.status,
            description: bookValues.description,
            year: bookValues.year,
            department: department.dataValues
        };
        const data = {
            book: bookData,
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        helper.responseHandle(res, 200, data);
    } catch (error) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.addBook = async (req, res) => {
    const imageBase64 = req.body.base64;
    if (!imageBase64) {
        return helper.responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    const bookData = JSON.parse(req.body.book_data);

    if (!bookData) {
        return helper.responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    const filepath = base64Img.imgSync(imageBase64, '../images/', uuidv4());

    status = statuses.FREE;

    try {
        const count = await Book.count({
            where: {
                isbn: bookData.isbn,
                departmentId: bookData.department.id
            }
        });

        if (count > 0) {
            const data = {
                isSuccessful: false,
                message: errorMessages.ISBN_EXIST
            };
            return helper.responseHandle(res, 200, data);
        } else {
            const newBook = new Book({
                isbn: bookData.isbn,
                name: bookData.name,
                authorId: bookData.author.id,
                genreId: bookData.genre.id,
                year: bookData.year,
                quantity: bookData.quantity,
                description: bookData.description,
                status: status,
                image: filepath,
                departmentId: bookData.department.id
            });

            await newBook.save();

            const data = {
                isSuccessful: true,
                message: successMessages.BOOK_SUCCESSFULLY_CREATED
            };
            return helper.responseHandle(res, 200, data);
        }
    } catch (error) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
