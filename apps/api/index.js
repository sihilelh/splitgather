import express from 'express';
import cors from 'cors';
import apiRouter from './routes/routes.js';
import { db } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize database connection
// The db instance is created when imported, establishing the connection
console.log('Database connection initialized');

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});