import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/JwtHelper';

// Extend the Request object type to include the 'user' payload from the JWT
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: string;
        username: string;
    };
}

/**
 * Middleware to verify the Json Web Token (JWT) in the request header (Requirement 1.c).
 * If successful, attaches the user payload to req.user.
 */
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // 1. Check for the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authorization token is missing or malformed.' });
        return;
    }

    // 2. Extract the token (removing "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verify the token using the helper
        const payload = verifyToken(token);
        
        // 4. Attach the user data to the request for controller access
        req.user = payload;
        
        // 5. Continue to the next middleware or route handler
        next();
    } catch (error) {
        // If the token is invalid (expired, wrong signature, etc.)
        console.error('JWT verification failed:', error);
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

/**
 * Middleware to restrict access based on user role (Requirement 9.b).
 * Must be used after authenticateJWT.
 * @param requiredRoles - Array of roles allowed to access the route (e.g., ['ADMIN', 'ANALYST'])
 */
export const checkRole = (requiredRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        // Check if req.user exists (meaning authenticateJWT ran successfully)
        if (!req.user) {
            res.status(403).json({ message: 'Access denied. Authentication required.' });
            return;
        }

        // Check if the user's role is included in the list of allowed roles
        if (requiredRoles.includes(req.user.role)) {
            next(); // Role is allowed, continue
        } else {
            // Access denied due to insufficient permissions
            res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
    };
};