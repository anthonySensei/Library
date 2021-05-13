import sequelize from '../config/database';
import Sequelize from 'sequelize';

const SequelizeBook = sequelize.define('book_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    isbn: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    image: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = SequelizeBook;
