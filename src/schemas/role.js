const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Role = sequelize.define('role_', {
    librarian_id: {
        field: 'librarian_id',
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    role: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Role;
