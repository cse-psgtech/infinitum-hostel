import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { connectDB } from './config/database';
import roomRoutes from './routes/room.routes';
import accommodationRoutes from './routes/accommodation.routes';
import deskRoutes from './routes/desk.routes';
import { initializeSocket } from './utils/socket';

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
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Hotel server is running');
});
app.get('/api/acc', (req, res) => {
  res.send('Hotel server is running with /api/acc');
});

app.use('/api/acc/rooms', roomRoutes);
app.use('/api/acc/accommodation', accommodationRoutes);
app.use('/api/acc/desk', deskRoutes);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
