import { Sequelize, Dialect } from 'sequelize';

const { DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD } = process.env;
const { DATABASE_DIALECT, DATABASE_HOST, DATABASE_PORT } = process.env;

export default new Sequelize(
    DATABASE_NAME as string,
    DATABASE_USER as string,
    DATABASE_PASSWORD as string,
    {
        dialect: DATABASE_DIALECT as Dialect,
        host: DATABASE_HOST as string,
        port: Number(DATABASE_PORT),
        logging: false
    }
);

