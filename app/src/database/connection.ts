import { Sequelize, Op } from 'sequelize';
import dotenv from 'dotenv';

import User from '../models/User';
import Client from '../models/Client';
import Warehouse from '../models/Warehouse';
import Product from '../models/Product';


import { seedUsers } from '../seeders/01-Users'
import { seedWarehouses } from '../seeders/02-Warehouse';
import { seedProducts } from '../seeders/03-Products';
// TODO: Import the remaining models (Client, Order, Product, Warehouse)

dotenv.config();

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

const initializeModels = () => {
    // Call the static method on the model and pass the sequelize instance
    // This is the CRUCIAL step that solves the "No Sequelize instance passed" error
    User.initialize(sequelize);
    Client.initialize(sequelize); 
    Warehouse.initialize(sequelize);
    Product.initialize(sequelize);
    // TODO: Initialize other models here, e.g., Client.initialize(sequelize);
};

// Function to establish and test the database connection
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        initializeModels();

        await sequelize.sync({ alter: true }); 
        console.log('Database synchronized: All models loaded and tables created/updated.');

        await seedUsers();
        await seedWarehouses();
        await seedProducts();

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        // Exit process if connection fails, as the app relies on the DB
        process.exit(1);
    }

};


export default sequelize;
export { sequelize, Op };