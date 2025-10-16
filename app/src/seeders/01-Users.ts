import User, { UserRole } from '../models/User';
import { ModelStatic, QueryInterface } from 'sequelize';

// Define the name of the model to use for seeding (for typing purposes)
const UserModel = User as ModelStatic<User>;

// IMPORTANT: Passwords will be hashed automatically by the 'beforeCreate' hook in the User model.
// For this seeder, we provide the raw password (e.g., 'admin123').

const initialUsers = [
    {
        username: 'admin.fhl',
        email: 'admin@fhl.com',
        password: 'adminpassword123', // Raw password
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        username: 'analyst.fhl',
        email: 'analyst@fhl.com',
        password: 'analystpassword123', // Raw password
        role: UserRole.ANALYST,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];


export async function seedUsers(queryInterface?: QueryInterface): Promise<void> {
    try {
        // Check if users already exist to prevent duplicate errors
        const existingUsers = await UserModel.count();
        if (existingUsers > 0) {
            console.log('01-Users Seeder: Users already exist. Skipping seeding.');
            return;
        }

        const usersToInsert = initialUsers.map(user => ({
            ...user,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        
        // 🔑 CRUCIAL: individualHooks: true tells Sequelize to execute the beforeCreate hook 
        // (which hashes the password) for every record in the bulk operation.
        await UserModel.bulkCreate(usersToInsert);
        console.log('01-Users Seeder: Successfully created initial Admin and Analyst users (Hashed via Model Hook).');
    } catch (error) {
        console.error('01-Users Seeder Error:', error);
    }
}