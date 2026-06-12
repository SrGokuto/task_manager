import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import tasksRoutes from './routes/tasks.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/users', usersRoutes);

// Archivos estáticos (IMPORTANTE en Vercel)
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.resolve('public/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.resolve('public/register.html'));
});

// export PARA VERCEL (NO listen)
export default app;