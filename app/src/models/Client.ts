import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 1. Define the attributes for the Client model
interface ClientAttributes {
    id: number;
    cedula: string;
    name: string;
    email: string;
    phone?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. Define the types for creation (ID is optional upon creation)
interface ClientCreationAttributes extends Optional<ClientAttributes, 'id'> {}

// 3. Define the Client Model class
class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
    public id!: number;
    public cedula!: string;
    public name!: string;
    public email!: string;
    public phone!: string;
    
    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Static method to initialize the model structure.
     * @param sequelize The initialized Sequelize instance.
     */
    public static initialize(sequelize: Sequelize): void {
        Client.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                cedula: {
                    type: DataTypes.STRING(20), // Use STRING(20) to allow for different ID formats
                    allowNull: false,
                    unique: true, // Crucial: Cédula must be unique
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                    validate: {
                        isEmail: true, // Ensures a valid email format
                    }
                },
                phone: {
                    type: DataTypes.STRING(15),
                    allowNull: true, // Phone is optional
                },
            },
            {
                tableName: 'clients',
                sequelize, 
                timestamps: true,
            }
        );
    }
}

export default Client;