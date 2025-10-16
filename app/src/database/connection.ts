import { Sequelize } from 'sequelize';

// Load environment variables from .env if not running in a container
// (Though in the current setup, docker-compose passes them)
// We use a fallback just in case or for local testing without Docker.
const DB_HOST = process.env.DB_HOST || 'db';
const DB_NAME = process.env.DB_NAME || 'pd_test_db';
const DB_USER = process.env.DB_USER || 'keshia_db';
const DB_PASSWORD = process.env.DB_PASSWORD || 'keshia123';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;

// Create the Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres', // Use PostgreSQL dialect
    logging: false, // Set to true to see SQL queries in the console
    define: {
        freezeTableName: true, // Prevents Sequelize from pluralizing table names
        timestamps: true, // Adds createdAt and updatedAt columns by default
    }
});

// Function to establish and test the database connection
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        // Exit process if connection fails, as the app relies on the DB
        process.exit(1);
    }
};

export default sequelize;