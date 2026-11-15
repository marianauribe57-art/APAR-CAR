import express from 'express';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import { sesion } from './config/sesion.js';

const app = express();

app.set('trust proxy', 1);   // en Vercel, para que la cookie secure funcione detrás del proxy
app.use(express.json());
app.use(sesion);
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

export default app;