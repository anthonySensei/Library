import Sequelize from 'sequelize';

import sequelize from '../config/database';

const Department = sequelize.define('department_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    address: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'You must enter department address' }
        }
    }
});

module.exports = Department;
