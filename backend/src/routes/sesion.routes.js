import { Router } from 'express';
import { cerrarSesion } from '../controllers/sesion.controller.js';

const router = Router();

router.post('/cerrar-sesion', cerrarSesion);

export default router;