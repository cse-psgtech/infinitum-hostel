import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { connectDB } from './config/database';
import roomRoutes from './routes/room.routes';
import accommodationRoutes from './routes/accommodation.routes';
import deskRoutes from './routes/desk.routes';
import userRoutes from './routes/user.routes';
import { initializeSocket } from './utils/socket';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);


// Initialize Socket.IO
initializeSocket(httpServer);

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  logger.info(`Incoming request: ${req.method} ${req.path}`, {
    particular: 'http_request',
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    if (res.statusCode >= 400) {
      logger.warn(`Request completed: ${req.method} ${req.path}`, {
        particular: 'http_response_error',
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    } else {
      logger.info(`Request completed: ${req.method} ${req.path}`, {
        particular: 'http_response_success',
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    }
  });
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Hotel server is running');
});
app.get('/inf/api/acc', (req, res) => {
  res.send('Hotel server is running with /api/acc');
});

app.use('/inf/api/acc/rooms', roomRoutes);
app.use('/inf/api/acc/accommodation', accommodationRoutes);
app.use('/inf/api/acc/desk', deskRoutes);
app.use('/inf/api/acc/user', userRoutes);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  logger.info(`Server started successfully`, {
    particular: 'server_startup',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});
