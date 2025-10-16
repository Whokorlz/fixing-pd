import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection'; // Instance of Sequelize
import bcrypt from 'bcryptjs';

// 1. Define possible user roles (Requirement 1.a)
export enum UserRole {
    ADMIN = 'ADMIN',
    ANALYST = 'ANALYST',
}

// 2. Define the attributes for the User model (the columns in the table)
interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password?: string; // Optional because we might not retrieve it sometimes
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}

// 3. Define the types for creation (ID is optional upon creation)
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// 4. Define the User Model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string; 
    public role!: UserRole;
    
    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Instance method to check password (used during login)
    public checkPassword(password: string): Promise<boolean> {
        // Uses bcrypt to compare the provided password with the hashed password stored in the DB
        return bcrypt.compare(password, this.password);
    }
}

// 5. Initialize the User model structure (table definition)
User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Usernames must be unique
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Emails must be unique
            validate: {
                isEmail: true, // Basic email validation
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            // Password length validation (Good Practice)
            validate: {
                len: [6, 100], 
            }
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)), // Use the defined enum values
            allowNull: false,
            defaultValue: UserRole.ANALYST, // Default to Analyst if not specified
        },
    },
    {
        tableName: 'users',
        sequelize, // Pass the sequelize instance
        // 6. Security Hook: Hash the password before saving (on creation or update)
        hooks: {
            beforeCreate: async (user: User) => {
                const salt = await bcrypt.genSalt(10); // Generate a salt (cost factor 10)
                user.password = await bcrypt.hash(user.password, salt); // Hash the password
            },
            beforeUpdate: async (user: User) => {
                // Only re-hash if the password field was modified
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
        },
    }
);

export default User;