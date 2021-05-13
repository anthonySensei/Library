import Sequelize from 'sequelize';

import sequelize from '../config/database';

const Loan = sequelize.define('loan_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    loan_time: {
        type: Sequelize.DATE,
        allowNull: false
    },
    returned_time: {
        type: Sequelize.DATE,
        allowNull: true
    }
});

module.exports = Loan;
