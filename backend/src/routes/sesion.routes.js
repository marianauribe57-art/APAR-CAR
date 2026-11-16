import { Router } from 'express';
import { cerrarSesion, postPrimerIngreso } from '../controllers/sesion.controller.js';
import { requiereSesion } from '../middlewares/session.middleware.js';

const router = Router();

router.post('/cerrar-sesion', cerrarSesion);
router.post('/primer-ingreso', requiereSesion, postPrimerIngreso);   // HU-38

export default router;
