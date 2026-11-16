import { Router } from 'express';
import { getOperarios, postOperario, patchDesactivarOperario } from '../controllers/operarios.controller.js';
import { requiereSesion, requiereRol } from '../middlewares/session.middleware.js';

// HU-38: solo el administrador configura (regla 2 del día 3)
const router = Router();

router.use(requiereSesion, requiereRol('ADMINISTRADOR'));

router.get('/', getOperarios);
router.post('/', postOperario);
router.patch('/:id/desactivar', patchDesactivarOperario);

export default router;
