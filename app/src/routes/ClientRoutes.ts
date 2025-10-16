import { Router } from 'express';
import { createClient, getAllClients, getClientById, updateClient, deleteClient } from '../controllers/ClientController';
import { authenticateJWT, checkRole } from '../middleware/AuthMiddleware';
import { UserRole } from '../models/User'; // Importamos los roles definidos

const router = Router();

/*
|--------------------------------------------------------------------------
| CRUD CLIENTES
|--------------------------------------------------------------------------
|
| Access restrictions based on roles:
| - POST /api/clients: ONLY ADMIN
| - GET /api/clients: ADMIN or ANALYST
| - PUT /api/clients/:id: ONLY ADMIN
| - DELETE /api/clients/:id: ONLY ADMIN
*/

// POST: Create a new client (Requires ADMIN role)
router.post('/', 
    authenticateJWT, 
    checkRole([UserRole.ADMIN]), 
    createClient
);

// GET: Fetch all clients (Requires ADMIN or ANALYST role)
router.get('/', 
    authenticateJWT, 
    checkRole([UserRole.ADMIN, UserRole.ANALYST]), 
    getAllClients
);

// GET: Fetch client by ID (Requires ADMIN or ANALYST role)
router.get('/:id', 
    authenticateJWT, 
    checkRole([UserRole.ADMIN, UserRole.ANALYST]), 
    getClientById
);

// PUT: Update client (Requires ADMIN role)
router.put('/:id', 
    authenticateJWT, 
    checkRole([UserRole.ADMIN]), 
    updateClient
);

// DELETE: Delete client (Requires ADMIN role)
router.delete('/:id', 
    authenticateJWT, 
    checkRole([UserRole.ADMIN]), 
    deleteClient
);

export default router;