import 'dotenv/config'; 
import express, { Application, Request, Response } from 'express';
import { connectDB } from './database/connection'; // Import the connection function
import AuthRoutes from './routes/AuthRoutes';
import ClientRoutes from './routes/ClientRoutes';

class Server {
    private app: Application;
    private port: number | string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        
        // Call initialization methods
        this.database(); // New method for DB connection
        this.middlewares();
        this.routes();
    }
    
    // New method to connect to the database
    private async database(): Promise<void> {
        await connectDB();
    }

    private middlewares(): void {
        this.app.use(express.json());
        this.app.use((req: Request, res: Response, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
            next();
        });
    }

    private routes(): void {
        this.app.get('/', (req: Request, res: Response) => {
            res.json({ message: 'FHL Logistics API is running!' });
        });
        
        // TODO: Register main router here:
        this.app.use('/api/auth', AuthRoutes);
        this.app.use('/api/clients', ClientRoutes);
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
            console.log(`Open http://localhost:${this.port}`);
        });
    }
}

// Start the server
const server = new Server();
server.listen();