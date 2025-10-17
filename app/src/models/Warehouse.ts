import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import Product from './Product';


// 1. Define the attributes for the Warehouse model
interface WarehouseAttributes {
    id: number;
    name: string;
    address: string;
    city: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. Define the types for creation (ID is optional upon creation)
interface WarehouseCreationAttributes extends Optional<WarehouseAttributes, 'id'> { }

// 3. Define the Warehouse Model class
class Warehouse extends Model<WarehouseAttributes, WarehouseCreationAttributes> implements WarehouseAttributes {
    public id!: number;
    public name!: string;
    public address!: string;
    public city!: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Static method to initialize the model structure.
     * @param sequelize The initialized Sequelize instance.
     */
    public static initialize(sequelize: Sequelize): void {
        Warehouse.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true, // Warehouse names must be unique
                },
                address: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                city: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
            },
            {
                tableName: 'warehouses',
                sequelize,
                timestamps: true,
            }
        );
    }

    /**
     * Static method to define model associations.
     * This is called from connection.ts AFTER all models are initialized.
     */
    public static associate(): void {
        // Defines the relationship: A Warehouse has many Products
        this.hasMany(Product, {
            foreignKey: 'warehouseId',
            as: 'products', // Alias for easier querying
        });

        // TODO: In the next step, we will add the association to the Order model (hasMany Order)
    }
}

export default Warehouse;