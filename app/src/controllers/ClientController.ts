import { Request, Response } from 'express';
import Client from '../models/Client';
// Importamos AuthenticatedRequest para poder acceder a req.user (datos del JWT)
import { AuthenticatedRequest } from '../middleware/AuthMiddleware'; 

/**
 * Handles the creation of a new client.
 * Endpoint: POST /api/clients
 */
export const createClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Note: The user who created the client is available in req.user
    const { cedula, name, email, phone } = req.body;

    // Basic input validation
    if (!cedula || !name || !email) {
        res.status(400).json({ message: 'Cedula, name, and email are required fields.' });
        return;
    }

    try {
        // Check if a client with the same cedula or email already exists
        const existingClient = await Client.findOne({ where: { cedula } });
        if (existingClient) {
            res.status(409).json({ message: 'A client with this cedula already exists.' });
            return;
        }

        const newClient = await Client.create({ cedula, name, email, phone });
        
        // Respond with the created client (excluding sensitive data, although clients have none)
        res.status(201).json({ 
            message: 'Client created successfully.',
            client: newClient 
        });
    } catch (error) {
        console.error('Error creating client:', error);
        // Handle unique constraint errors (e.g., if email is duplicated)
        if (error instanceof Error && (error as any).name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ message: 'Email address is already in use.' });
            return;
        }
        res.status(500).json({ message: 'Internal server error.' });
    }
};

/**
 * Handles fetching all clients.
 * Endpoint: GET /api/clients
 */
export const getAllClients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Find all clients, ordered by creation date
        const clients = await Client.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

/**
 * Handles fetching a single client by ID.
 * Endpoint: GET /api/clients/:id
 */
export const getClientById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const client = await Client.findByPk(id);

        if (!client) {
            res.status(404).json({ message: 'Client not found.' });
            return;
        }

        res.status(200).json(client);
    } catch (error) {
        console.error('Error fetching client by ID:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

/**
 * Handles updating an existing client.
 * Endpoint: PUT /api/clients/:id
 */
export const updateClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    try {
        const client = await Client.findByPk(id);

        if (!client) {
            res.status(404).json({ message: 'Client not found.' });
            return;
        }

        // Update the client record
        await client.update({ name, email, phone });

        res.status(200).json({ 
            message: 'Client updated successfully.',
            client
        });
    } catch (error) {
        console.error('Error updating client:', error);
        if (error instanceof Error && (error as any).name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ message: 'Email address is already in use.' });
            return;
        }
        res.status(500).json({ message: 'Internal server error.' });
    }
};

/**
 * Handles deleting a client.
 * Endpoint: DELETE /api/clients/:id
 */
export const deleteClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const client = await Client.findByPk(id);

        if (!client) {
            res.status(404).json({ message: 'Client not found.' });
            return;
        }

        // Perform soft delete if necessary, but here we do a hard delete
        await client.destroy();

        res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};