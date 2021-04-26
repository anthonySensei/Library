import Sequelize from 'sequelize';

import sequelize from '../config/database';

const Librarian = sequelize.define('librarian_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
            notNull: { msg: 'Please fill in email' }
        },
        unique: true
    },
    profile_image: {
        type: Sequelize.STRING,
        allowNull: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = Librarian;
