import { prisma } from '../config/prisma.js';

// ¿Hay alguien con sesión iniciada?
export function requiereSesion(req, res, next) {
  if (!req.session?.usuario) {
    return res.status(401).json({
      error: 'SIN_SESION',
      mensaje: 'Debes iniciar sesión.',
    });
  }
  next();
}

// ¿La persona tiene alguno de los roles permitidos?
// Uso: router.get('/ruta', requiereSesion, requiereRol('ADMINISTRADOR'), controlador)
export function requiereRol(...rolesPermitidos) {
  return async (req, res, next) => {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: req.session.usuario.id },
        select: { rol: true, activo: true },
      });

      if (!usuario || !usuario.activo) {
        req.session.destroy(() => {});
        return res.status(401).json({
          error: 'SIN_SESION',
          mensaje: 'Debes iniciar sesión.',
        });
      }

      if (!rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({
          error: 'SIN_PERMISO',
          mensaje: 'No tienes permiso para esta acción.',
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}