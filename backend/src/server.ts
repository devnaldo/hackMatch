import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/db';
import { swaggerSpec } from './config/swagger';
import { SocketService } from './services/socketService';
import { seedDatabase } from './seed';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import teamRoutes from './routes/teamRoutes';
import hackathonRoutes from './routes/hackathonRoutes';
import matchRoutes from './routes/matchRoutes';
import requestRoutes from './routes/requestRoutes';
import messageRoutes from './routes/messageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import ideaRoutes from './routes/ideaRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger OpenAPI Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'HackMatch TypeScript Express Backend',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    data: null,
    message: err.message || 'Internal server error',
  });
});

// Create HTTP server and initialize WebSockets
const server = http.createServer(app);
SocketService.init(server);

// Start server
server.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 HackMatch Express Server running on port ${PORT}`);
  console.log(`📄 Swagger Docs available at: http://localhost:${PORT}/api-docs`);
  console.log(`=======================================================`);

  await connectDB();
  await seedDatabase();
});

export default app;
