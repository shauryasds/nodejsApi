import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { initializeDatabase } from './database.js';
import { schoolRoutes } from './routes/schools.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase().then(()=>console.log("Db connected")).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', schoolRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});