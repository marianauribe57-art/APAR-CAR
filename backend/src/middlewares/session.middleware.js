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

// HU-39: guarda quién intentó entrar y a dónde, sin datos sensibles (ni body ni cookies).
// Si la bitácora falla, igual se responde 403: negar el acceso es lo importante.
async function registrarAccesoDenegado(req, usuario) {
  try {
    await prisma.bitacora.create({
      data: {
        usuarioId: req.session.usuario.id,
        parqueaderoId: usuario.personal?.parqueaderoId ?? null,
        accion: 'ACCESO_DENEGADO',
        entidad: 'Ruta',
        detalle: { metodo: req.method, ruta: req.originalUrl, rol: usuario.rol, ip: req.ip },
      },
    });
  } catch (error) {
    console.error('No se pudo registrar ACCESO_DENEGADO en la bitácora:', error.message);
  }
}

// ¿La persona tiene alguno de los roles permitidos?
// Uso: router.get('/ruta', requiereSesion, requiereRol('ADMINISTRADOR'), controlador)
export function requiereRol(...rolesPermitidos) {
  return async (req, res, next) => {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: req.session.usuario.id },
        select: {
          rol: true,
          activo: true,
          debeCambiarContrasena: true,
          personal: { select: { parqueaderoId: true } },
        },
      });

      if (!usuario || !usuario.activo) {
        req.session.destroy(() => {});
        return res.status(401).json({
          error: 'SIN_SESION',
          mensaje: 'Debes iniciar sesión.',
        });
      }

      // HU-38: mientras no cambie la contraseña inicial, solo puede ir al primer ingreso
      if (usuario.debeCambiarContrasena) {
        return res.status(403).json({
          error: 'CAMBIO_CONTRASENA_REQUERIDO',
          mensaje: 'Antes de seguir, acepta la política y cambia tu contraseña.',
        });
      }

      // HU-39: rol sin permiso -> 403 y el intento queda en la bitácora (RNF-07)
      if (!rolesPermitidos.includes(usuario.rol)) {
        await registrarAccesoDenegado(req, usuario);
        return res.status(403).json({
          error: 'ACCESO_DENEGADO',
          mensaje: 'No tienes permiso para esta acción.',
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}