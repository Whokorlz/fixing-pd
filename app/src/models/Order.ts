import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
// Models
import Client from './Client';
import Warehouse from './Warehouse';
import Product from './Product';
import OrderProduct from './OrderProduct'; 

// Define the possible statuses for an Order
export enum OrderStatus {
    PENDING = 'PENDING',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

// 1. Define the attributes for the Order model
interface OrderAttributes {
    id: number;
    orderNumber: string;
    clientId: number; // Foreign Key to Client
    warehouseId: number; // Foreign Key to Warehouse
    deliveryAddress: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'orderNumber' | 'status' | 'totalAmount'> {}

// 3. Define the Order Model class
class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    public id!: number;
    public orderNumber!: string;
    public clientId!: number;
    public warehouseId!: number;
    public deliveryAddress!: string;
    public status!: OrderStatus;
    public totalAmount!: number;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Static method to define model associations.
     */
    public static associate(): void {
        // 1. Order belongs to one Client (Consultar historial de órdenes por cliente)
        this.belongsTo(Client, {
            foreignKey: 'clientId',
            as: 'client',
        });
        
        // 2. Order belongs to one Warehouse (Asignar orden a bodega)
        this.belongsTo(Warehouse, {
            foreignKey: 'warehouseId',
            as: 'warehouse',
        });
        
        // 3. Many-to-Many relationship with Product (Crear órdenes con productos solicitados)
        this.belongsToMany(Product, {
            through: OrderProduct,
            foreignKey: 'orderId',
            otherKey: 'productId',
            as: 'products',
        });
    }

    /**
     * Static method to initialize the model structure.
     * @param sequelize The initialized Sequelize instance.
     */
    public static initialize(sequelize: Sequelize): void {
        Order.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                orderNumber: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    unique: true,
                },
                clientId: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: false,
                },
                warehouseId: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: false,
                },
                deliveryAddress: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(OrderStatus)),
                    allowNull: false,
                    defaultValue: OrderStatus.PENDING, 
                },
                totalAmount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    defaultValue: 0.00, // Se calcula en el controlador
                }
            },
            {
                tableName: 'orders',
                sequelize, 
                timestamps: true,
            }
        );
    }
}

export default Order;