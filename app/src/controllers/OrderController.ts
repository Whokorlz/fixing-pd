import { Response } from 'express';

import { AuthenticatedRequest } from '../middleware/AuthMiddleware'; 
import Order, { OrderStatus } from '../models/Order';
import Client from '../models/Client';
import Warehouse from '../models/Warehouse';
import Product from '../models/Product';
import OrderProduct from '../models/OrderProduct';
import { sequelize, Op } from '../database/connection';

// Helper function to generate a unique order number (e.g., FHL-20251017-0001)
const generateOrderNumber = async (): Promise<string> => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
    // Find the last order number for today to increment the sequence
    const lastOrder = await Order.findOne({
        where: { orderNumber: { [Op.like]: `FHL-${datePart}%` } },
        order: [['orderNumber', 'DESC']],
        limit: 1,
        attributes: ['orderNumber'],
        raw: true
    });

    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
        const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
        sequence = lastSequence + 1;
    }
    
    return `FHL-${datePart}-${String(sequence).padStart(4, '0')}`;
};

/**
 * Handles the creation of a new order (Requirement: Create orders with requested products).
 * Endpoint: POST /api/orders
 * Role: ADMIN only
 */
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { clientId, warehouseId, deliveryAddress, products } = req.body; // 'products' is an array: [{ productId: number, quantity: number }]

    if (!clientId || !warehouseId || !deliveryAddress || !products || products.length === 0) {
        res.status(400).json({ message: 'Client ID, Warehouse ID, delivery address, and products are required.' });
        return;
    }

    let transaction;
    try {
        transaction = await sequelize.transaction();

        // 1. Validate Client and Warehouse existence
        const client = await Client.findByPk(clientId, { transaction });
        const warehouse = await Warehouse.findByPk(warehouseId, { transaction });

        if (!client) {
            await transaction.rollback();
            res.status(404).json({ message: 'Client not found.' });
            return;
        }
        if (!warehouse) {
            await transaction.rollback();
            res.status(404).json({ message: 'Warehouse not found.' });
            return;
        }

        // 2. Validate Products, calculate total, and prepare pivot data
       const productIds: number[] = products.map((p: any) => p.productId) as number[];
        const uniqueProductIds: number[] = [...new Set(productIds)]; 
        
        if (productIds.length !== uniqueProductIds.length) {
             await transaction.rollback();
             res.status(400).json({ message: 'Duplicate products found in the request list.' });
             return;
        }

        const dbProducts = await Product.findAll({
            where: { id: uniqueProductIds },
            attributes: ['id', 'price'],
            raw: true,
            transaction
        });

        if (dbProducts.length !== uniqueProductIds.length) {
            await transaction.rollback();
            res.status(404).json({ message: 'One or more products were not found.' });
            return;
        }

        let totalAmount = 0;
        const orderProductsData = [];

        for (const reqProduct of products) {
            const dbProduct = dbProducts.find(p => p.id === reqProduct.productId);
            const quantity = parseInt(reqProduct.quantity);
            
            if (!dbProduct || quantity <= 0 || isNaN(quantity)) {
                await transaction.rollback();
                res.status(400).json({ message: `Invalid quantity or product ID for product: ${reqProduct.productId}.` });
                return;
            }

            const unitPrice = parseFloat(dbProduct.price.toString());
            const subtotal = unitPrice * quantity;
            totalAmount += subtotal;

            orderProductsData.push({
                productId: reqProduct.productId,
                quantity: quantity,
                unitPrice: unitPrice,
            });
        }

        // 3. Generate unique order number
        const orderNumber = await generateOrderNumber();
        
        // 4. Create the Order (Requirement: Assign order to a dispatch warehouse)
        const newOrder = await Order.create({
            orderNumber,
            clientId,
            warehouseId,
            deliveryAddress,
            status: OrderStatus.PENDING,
            totalAmount: totalAmount,
        }, { transaction });

        // 5. Create entries in the OrderProduct pivot table
        const pivotData = orderProductsData.map(op => ({
            ...op,
            orderId: newOrder.id,
        }));

        await OrderProduct.bulkCreate(pivotData, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Order created successfully.',
            order: newOrder,
            products: orderProductsData,
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error during order creation.' });
    }
};

/**
 * Handles fetching all orders.
 * Endpoint: GET /api/orders
 * Role: ADMIN or ANALYST
 */
export const getAllOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const orders = await Order.findAll({
            // Include associations for context
            include: [
                { model: Client, as: 'client', attributes: ['id', 'name', 'email'] },
                { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'city'] },
                { model: Product, as: 'products', attributes: ['id', 'sku', 'name'], through: { attributes: ['quantity', 'unitPrice'] } }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

/**
 * Handles fetching orders by client ID (Requirement: Consult order history for each client).
 * Endpoint: GET /api/orders/client/:clientId
 * Role: ADMIN or ANALYST
 */
export const getOrdersByClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { clientId } = req.params;

    try {
        const orders = await Order.findAll({
            where: { clientId: clientId },
            include: [
                { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'city'] },
                { model: Product, as: 'products', attributes: ['id', 'sku', 'name'], through: { attributes: ['quantity', 'unitPrice'] } }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (orders.length === 0) {
            res.status(404).json({ message: 'No orders found for this client.' });
            return;
        }
        
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching client orders:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

/**
 * Handles updating the status of an existing order (Requirement: Control the status of each order).
 * Endpoint: PUT /api/orders/:id/status
 * Role: ADMIN only
 */
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
        res.status(400).json({ message: `Invalid status. Must be one of: ${Object.values(OrderStatus).join(', ')}.` });
        return;
    }

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            res.status(404).json({ message: 'Order not found.' });
            return;
        }

        // Prevent setting 'PENDING' if the order is already past that initial state
        if (status === OrderStatus.PENDING && order.status !== OrderStatus.PENDING) {
             res.status(400).json({ message: `Cannot reset status to PENDING. Current status is ${order.status}.` });
             return;
        }

        // Update the order status
        await order.update({ status });

        res.status(200).json({ 
            message: `Order status updated to ${status} successfully.`,
            order
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};