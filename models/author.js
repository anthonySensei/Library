const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Author = sequelize.define('author_', {
    id: {
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = Author;
