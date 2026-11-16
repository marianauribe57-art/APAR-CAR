import { prisma } from '../config/prisma.js';

export function buscarUsuarioParaPrimerIngreso(usuarioId) {
  return prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      activo: true,
      debeCambiarContrasena: true,
      hashContrasena: true,
      personal: { select: { parqueaderoId: true } },
    },
  });
}

// Consentimiento + contraseña nueva + Bitácora: todo junto o nada
export function completarPrimerIngreso({ usuarioId, parqueaderoId, hashContrasena, versionPolitica, ip }) {
  return prisma.$transaction([
    prisma.consentimiento.create({
      data: { usuarioId, versionPolitica },
    }),
    prisma.usuario.update({
      where: { id: usuarioId },
      data: { hashContrasena, debeCambiarContrasena: false },
    }),
    // RNF-07: nunca la contraseña en la bitácora
    prisma.bitacora.create({
      data: {
        usuarioId,
        parqueaderoId,
        accion: 'PRIMER_INGRESO',
        entidad: 'Usuario',
        detalle: { ip, versionPolitica },
      },
    }),
  ]);
}
