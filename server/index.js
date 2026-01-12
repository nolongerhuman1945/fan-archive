import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ao3Routes from './ao3/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

app.use('/api/ao3', ao3Routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AO3 proxy server is running' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AO3 Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
