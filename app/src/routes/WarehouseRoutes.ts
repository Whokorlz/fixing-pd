import { Router } from 'express';
import { createWarehouse, getAllWarehouses, getWarehouseById, updateWarehouse, deleteWarehouse } from '../controllers/WarehouseController';
import { authenticateJWT, checkRole } from '../middleware/AuthMiddleware';
import { UserRole } from '../models/User'; 

const router = Router();

/*
|--------------------------------------------------------------------------
| CRUD BODEGAS - Protección de Rutas por Rol
|--------------------------------------------------------------------------
| - POST, PUT, DELETE (Gestión de inventario): Solo ADMIN
| - GET (Consulta): ADMIN o ANALYST
*/

// POST: Crear nueva bodega (Solo ADMIN)
router.post('/', 
    authenticateJWT, 
    checkRole([UserRole.ADMIN]), 
    createWarehouse
);

// GET: Listar todas las bodegas (ADMIN o ANALYST)
router.get('/', 
    authenticateJWT, 
    checkRole([UserRole.ADMIN, UserRole.ANALYST]), 
    getAllWarehouses
);

// GET: Obtener bodega por ID (ADMIN o ANALYST)
router.get('/:id', 
    authenticateJWT, 
    checkRole([UserRole.ADMIN, UserRole.ANALYST]), 
    getWarehouseById
);

// PUT: Actualizar bodega (Solo ADMIN)
router.put('/:id', 
    authenticateJWT, 
    checkRole([UserRole.ADMIN]), 
    updateWarehouse
);

// DELETE: Eliminar bodega (Solo ADMIN)
router.delete('/:id', 
    authenticateJWT, 
    checkRole([UserRole.ADMIN]), 
    deleteWarehouse
);

export default router;