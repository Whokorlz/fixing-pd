import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import Warehouse from './Warehouse'; // Importamos el modelo Warehouse

// 1. Define the attributes for the Product model
interface ProductAttributes {
    id: number;
    sku: string; // Stock Keeping Unit (Unique Identifier)
    name: string;
    description?: string;
    price: number;
    warehouseId: number; // Foreign Key to Warehouse
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. Define the types for creation (ID is optional upon creation)
interface ProductCreationAttributes extends Optional<ProductAttributes, 'id'> {}

// 3. Define the Product Model class
class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    public id!: number;
    public sku!: string;
    public name!: string;
    public description!: string;
    public price!: number;
    public warehouseId!: number;
    
    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Association method (Defined in Step 15.2)
    public static associate(): void {
        // Defines the relationship: A Product belongs to one Warehouse
        this.belongsTo(Warehouse, {
            foreignKey: 'warehouseId',
            as: 'warehouse', // Alias for easier querying
        });
    }

    /**
     * Static method to initialize the model structure.
     * @param sequelize The initialized Sequelize instance.
     */
    public static initialize(sequelize: Sequelize): void {
        Product.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                sku: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    unique: true, // SKUs must be unique for inventory tracking
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                price: {
                    type: DataTypes.DECIMAL(10, 2), // Price up to 10 digits, 2 decimal places
                    allowNull: false,
                    validate: {
                        isDecimal: true,
                        min: 0,
                    }
                },
                warehouseId: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: false,
                },
            },
            {
                tableName: 'products',
                sequelize, 
                timestamps: true,
            }
        );
    }
}

export default Product;