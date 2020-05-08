const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Genre = sequelize.define('genre_', {
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

module.exports = Genre;
