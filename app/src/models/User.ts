import { DataTypes, Model,Optional,Sequelize} from 'sequelize';
import bcrypt from 'bcrypt'

// 1. Define possible user roles (Requirement 1.a)
export enum UserRole {
    ADMIN = 'ADMIN',
    ANALYST = 'ANALYST',
}

//Define the attributes for the User model (the columns in the table)
interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password?: string;
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

    public checkPassword(password: string): Promise<boolean> {
        // Uses bcrypt to compare the provided password with the hashed password
        return bcrypt.compare(password, this.password);
    }

    // 5. NEW: Static method to initialize the model
    public static initialize(sequelize: Sequelize): void {
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
                    unique: true, 
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true, 
                    validate: {
                        isEmail: true,
                    }
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    validate: {
                        len: [6, 100], 
                    }
                },
                role: {
                    type: DataTypes.ENUM(...Object.values(UserRole)),
                    allowNull: false,
                    defaultValue: UserRole.ANALYST,
                },
            },
            {
                tableName: 'users',
                sequelize
            }
        );
    }
}

export default User;