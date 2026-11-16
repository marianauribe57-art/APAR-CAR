import { Router } from 'express';
import {
  postIniciarSesion,
  getSesion,
  postRegistroAdministrador,
  postRegistroCliente,
} from '../controllers/auth.controller.js';
import { requiereSesion } from '../middlewares/session.middleware.js';

const router = Router();

router.post('/iniciar-sesion', postIniciarSesion);
router.get('/sesion', requiereSesion, getSesion);
router.post('/registro-administrador', postRegistroAdministrador);
router.post('/registro-cliente', postRegistroCliente);

export default router;