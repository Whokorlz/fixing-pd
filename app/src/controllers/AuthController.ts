import { Request, Response } from 'express';
import User from '../models/User';
import { createToken } from '../utils/JwtHelper';

/**
 * Handles the user login process.
 * Endpoint: POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // 1. Basic input validation
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }

    try {
        // 2. Find the user by email
        // We ensure we only search for 'active' users or handle soft deletion if implemented
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Use a generic error message for security
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        // 3. Compare the raw password with the hashed password in the database
        // This uses the checkPassword instance method defined in User.ts
        const isMatch = await user.checkPassword(password); 

        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        // 4. If credentials are valid, create the JWT payload
        const payload = {
            id: user.id,
            role: user.role,
            username: user.username,
        };

        const token = createToken(payload);

        // 5. Send back the token and user role
        res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role,
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};

// NOTE: For future, any user creation (e.g., POST /api/auth/register) must include 
// manual password hashing (using bcrypt) inside the controller since hooks were removed.