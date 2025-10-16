import jwt from 'jsonwebtoken';

// Get the secret key from environment variables (CRUCIAL for security)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const TOKEN_EXPIRATION = '1d'; // Token expires in 1 day

interface TokenPayload {
    id: number;
    role: string;
    username: string;
}

/**
 * Creates a Json Web Token (JWT) for a successful login.
 * @param payload - Data to be included in the token (User ID, Role, Username)
 * @returns The signed JWT string
 */
export const createToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRATION,
    });
};

/**
 * Decodes and verifies a JWT token.
 * @param token - The JWT string
 * @returns The payload if valid, or throws an error if invalid/expired
 */
export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
};