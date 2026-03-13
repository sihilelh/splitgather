import express from 'express';
import cors from 'cors';
import apiRouter from './routes/routes.js';
import { db } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize database connection
// The db instance is created when imported, establishing the connection
console.log('Database connection initialized');

// CORS configuration - allow frontend origin with credentials
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server default port
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});