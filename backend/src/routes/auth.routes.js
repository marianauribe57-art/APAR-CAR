import { Router } from 'express';
import { postIniciarSesion, getSesion } from '../controllers/auth.controller.js';
import { requiereSesion } from '../middlewares/session.middleware.js';

const router = Router();

router.post('/iniciar-sesion', postIniciarSesion);
router.get('/sesion', requiereSesion, getSesion);

export default router;