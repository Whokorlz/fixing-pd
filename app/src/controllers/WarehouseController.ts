import { Response } from 'express';
import Warehouse from '../models/Warehouse';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware'; 

/**
 * Handles the creation of a new warehouse.
 * Endpoint: POST /api/warehouses
 * Role: ADMIN only
 */
export const createWarehouse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name, address, city } = req.body;

    if (!name || !address || !city) {
        res.status(400).json({ message: 'Name, address, and city son campos obligatorios.' });
        return;
    }

    try {
        const existingWarehouse = await Warehouse.findOne({ where: { name } });
        if (existingWarehouse) {
            res.status(409).json({ message: 'Una bodega con este nombre ya existe.' });
            return;
        }

        const newWarehouse = await Warehouse.create({ name, address, city });
        
        res.status(201).json({ 
            message: 'Bodega creada exitosamente.',
            warehouse: newWarehouse 
        });
    } catch (error) {
        console.error('Error creando bodega:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * Handles fetching all warehouses.
 * Endpoint: GET /api/warehouses
 * Role: ADMIN or ANALYST
 */
export const getAllWarehouses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const warehouses = await Warehouse.findAll({
            order: [['name', 'ASC']]
        });
        
        res.status(200).json(warehouses);
    } catch (error) {
        console.error('Error obteniendo bodegas:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * Handles fetching a single warehouse by ID.
 * Endpoint: GET /api/warehouses/:id
 * Role: ADMIN or ANALYST
 */
export const getWarehouseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const warehouse = await Warehouse.findByPk(id);

        if (!warehouse) {
            res.status(404).json({ message: 'Bodega no encontrada.' });
            return;
        }

        res.status(200).json(warehouse);
    } catch (error) {
        console.error('Error obteniendo bodega por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * Handles updating an existing warehouse.
 * Endpoint: PUT /api/warehouses/:id
 * Role: ADMIN only
 */
export const updateWarehouse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, address, city } = req.body;

    try {
        const warehouse = await Warehouse.findByPk(id);

        if (!warehouse) {
            res.status(404).json({ message: 'Bodega no encontrada.' });
            return;
        }

        await warehouse.update({ name, address, city });

        res.status(200).json({ 
            message: 'Bodega actualizada exitosamente.',
            warehouse
        });
    } catch (error) {
        console.error('Error actualizando bodega:', error);
        if (name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ message: 'El nombre de bodega ya está en uso.' });
            return;
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * Handles deleting a warehouse.
 * Endpoint: DELETE /api/warehouses/:id
 * Role: ADMIN only
 */
export const deleteWarehouse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const warehouse = await Warehouse.findByPk(id);

        if (!warehouse) {
            res.status(404).json({ message: 'Bodega no encontrada.' });
            return;
        }

        // TODO: Implement logic to check if there are associated products or pending orders 
        // before deletion (good practice). For now, we perform a hard delete.

        await warehouse.destroy();

        res.status(204).send(); // 204 No Content
    } catch (error) {
        console.error('Error eliminando bodega:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};