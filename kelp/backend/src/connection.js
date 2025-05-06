import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize';

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

let db;

if (process.env.NODE_ENV === 'test') {
    db = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    });
} else {
    db = new Sequelize(database, user, password, {
        host: host,
        dialect: 'mysql',
    });
}

const connection = async () => {
    db.authenticate()
        .then(() => {
            console.log(
                'Connection has been established successfully.'
            );
        })
        .catch((error) => {
            console.error(
                'Unable to connect to the database:', error
            );
        });
    return db;
};

export default connection;