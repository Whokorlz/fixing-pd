import { Response } from 'express';
import Product from '../models/Product';
import Warehouse from '../models/Warehouse';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware'; 

/**
 * Handles the creation of a new product.
 * Endpoint: POST /api/products
 * Role: ADMIN only
 */
export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { sku, name, description, price, warehouseId } = req.body;

    if (!sku || !name || !price || !warehouseId) {
        res.status(400).json({ message: 'SKU, nombre, precio y warehouseId son campos obligatorios.' });
        return;
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        res.status(400).json({ message: 'El precio debe ser un número válido y no negativo.' });
        return;
    }

    try {
        // 1. Check if the SKU already exists
        const existingProduct = await Product.findOne({ where: { sku } });
        if (existingProduct) {
            res.status(409).json({ message: 'Ya existe un producto con este SKU.' });
            return;
        }
        
        // 2. Check if the Warehouse exists
        const warehouse = await Warehouse.findByPk(warehouseId);
        if (!warehouse) {
            res.status(404).json({ message: 'La bodega especificada (warehouseId) no fue encontrada.' });
            return;
        }

        const newProduct = await Product.create({ 
            sku, 
            name, 
            description, 
            price: parseFloat(price), 
            warehouseId 
        });
        
        res.status(201).json({ 
            message: 'Producto creado exitosamente.',
            product: newProduct 
        });
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * Handles fetching all products.
 * Endpoint: GET /api/products
 * Role: ADMIN or ANALYST
 */
export const getAllProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const products = await Product.findAll({
            // Include the associated Warehouse for context
            include: [{
                model: Warehouse,
                as: 'warehouse',
                attributes: ['id', 'name', 'city'] 
            }],
            order: [['name', 'ASC']]
        });
        
        res.status(200).json(products);
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * Handles fetching a single product by ID.
 * Endpoint: GET /api/products/:id
 * Role: ADMIN or ANALYST
 */
export const getProductById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id, {
            // Include the associated Warehouse
            include: [{
                model: Warehouse,
                as: 'warehouse',
                attributes: ['id', 'name', 'city']
            }]
        });

        if (!product) {
            res.status(404).json({ message: 'Producto no encontrado.' });
            return;
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error obteniendo producto por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * Handles updating an existing product.
 * Endpoint: PUT /api/products/:id
 * Role: ADMIN only
 */
export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, price, warehouseId } = req.body;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            res.status(404).json({ message: 'Producto no encontrado.' });
            return;
        }

        // 1. Check if the new warehouseId is valid (if provided)
        if (warehouseId) {
            const warehouse = await Warehouse.findByPk(warehouseId);
            if (!warehouse) {
                res.status(404).json({ message: 'La bodega especificada (warehouseId) no fue encontrada.' });
                return;
            }
        }
        
        // 2. Prepare update data and handle price validation
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (warehouseId !== undefined) updateData.warehouseId = warehouseId;
        
        if (price !== undefined) {
            if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
                res.status(400).json({ message: 'El precio debe ser un número válido y no negativo.' });
                return;
            }
            updateData.price = parseFloat(price);
        }

        // 3. Update the record
        await product.update(updateData);

        res.status(200).json({ 
            message: 'Producto actualizado exitosamente.',
            product
        });
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * Handles deleting a product.
 * Endpoint: DELETE /api/products/:id
 * Role: ADMIN only
 */
export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            res.status(404).json({ message: 'Producto no encontrado.' });
            return;
        }

        // Se requiere lógica de verificación de órdenes pendientes (por simplicidad, borramos directamente)
        await product.destroy();

        res.status(204).send(); // 204 No Content
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};