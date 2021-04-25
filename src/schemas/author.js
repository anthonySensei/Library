const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Author = sequelize.define('author_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Author;
