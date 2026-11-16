import { registrarPrimerIngreso } from '../services/sesion.service.js';

// HU-04: cerrar mi sesión
export function cerrarSesion(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie('aparcar.sid');
    res.status(204).end();
  });
}

// HU-38: POST /api/auth/primer-ingreso
export async function postPrimerIngreso(req, res) {
  const resultado = await registrarPrimerIngreso(req.body ?? {}, {
    usuarioId: req.session.usuario.id,
    ip: req.ip,
  });

  if (resultado.status === 204) return res.status(204).end();
  if (resultado.status === 401) req.session.destroy(() => {});
  res.status(resultado.status).json(resultado.cuerpo);
}
