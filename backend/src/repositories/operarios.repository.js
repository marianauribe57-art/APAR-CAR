import { prisma } from '../config/prisma.js';

const CAMPOS_OPERARIO = {
  id: true,
  nombre: true,
  correo: true,
  telefono: true,
  activo: true,
  debeCambiarContrasena: true,
  creadoEn: true,
};

// GET: los operarios cuyo Personal es de este parqueadero
export function buscarOperariosDelParqueadero(parqueaderoId) {
  return prisma.usuario.findMany({
    where: { rol: 'OPERARIO', personal: { parqueaderoId } },
    select: CAMPOS_OPERARIO,
    orderBy: { creadoEn: 'desc' },
  });
}

// HU-38: Usuario + Personal + Bitácora en la misma $transaction
export function crearOperarioConPersonal({ usuario, parqueaderoId, adminId, ip }) {
  return prisma.$transaction(async (tx) => {
    const operario = await tx.usuario.create({
      data: { ...usuario, rol: 'OPERARIO', debeCambiarContrasena: true },
      select: CAMPOS_OPERARIO,
    });

    await tx.personal.create({
      data: { usuarioId: operario.id, parqueaderoId },
    });

    // RNF-07: nunca la contraseña en la bitácora
    await tx.bitacora.create({
      data: {
        usuarioId: adminId,
        parqueaderoId,
        accion: 'OPERARIO_CREADO',
        entidad: 'Usuario',
        detalle: { operarioId: operario.id, ip, declaraAutorizacion: true },
      },
    });

    return operario;
  });
}

// Solo lo encuentra si es OPERARIO y su Personal es de MI parqueadero
export function buscarOperarioDelParqueadero(operarioId, parqueaderoId) {
  return prisma.usuario.findFirst({
    where: { id: operarioId, rol: 'OPERARIO', personal: { parqueaderoId } },
    select: { id: true, activo: true },
  });
}

export function marcarOperarioInactivo({ operarioId, parqueaderoId, adminId, ip }) {
  return prisma.$transaction([
    prisma.usuario.update({
      where: { id: operarioId },
      data: { activo: false },
    }),
    prisma.bitacora.create({
      data: {
        usuarioId: adminId,
        parqueaderoId,
        accion: 'OPERARIO_DESACTIVADO',
        entidad: 'Usuario',
        detalle: { operarioId, ip },
      },
    }),
  ]);
}
