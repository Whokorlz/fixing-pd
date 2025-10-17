import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 1. Define the attributes for the OrderProduct model
// This table stores the quantity and price of a specific product within a specific order.
interface OrderProductAttributes {
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: number; // Price at the moment the order was placed
}

// 2. Define the types for creation
interface OrderProductCreationAttributes extends OrderProductAttributes {}

// 3. Define the OrderProduct Model class
class OrderProduct extends Model<OrderProductAttributes, OrderProductCreationAttributes> implements OrderProductAttributes {
    public orderId!: number;
    public productId!: number;
    public quantity!: number;
    public unitPrice!: number;
    
    /**
     * Static method to initialize the model structure.
     * @param sequelize The initialized Sequelize instance.
     */
    public static initialize(sequelize: Sequelize): void {
        OrderProduct.init(
            {
                orderId: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: false,
                    primaryKey: true, // Part of the composite primary key
                },
                productId: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: false,
                    primaryKey: true, // Part of the composite primary key
                },
                quantity: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: false,
                    defaultValue: 1,
                    validate: {
                        min: 1,
                    }
                },
                unitPrice: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                }
            },
            {
                tableName: 'order_products',
                sequelize, 
                timestamps: false, // Pivot tables typically don't need timestamps
            }
        );
    }
    
    // NOTE: This model does not need an associate method because its associations
    // are defined by the Order and Product models (belongsToMany).
}

export default OrderProduct;