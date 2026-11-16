import { prisma } from '../config/prisma.js';

// RN-18: el correo es único en toda la plataforma
export function buscarUsuarioPorCorreo(correo) {
  return prisma.usuario.findUnique({ where: { correo }, select: { id: true } });
}

// HU-01: Usuario, Parqueadero, Personal, Consentimiento y Bitácora se crean juntos o no se crea ninguno
export function crearAdministrador({ usuario, parqueadero, versionPolitica, ip }) {
  return prisma.$transaction(async (tx) => {
    const nuevoUsuario = await tx.usuario.create({
      data: { ...usuario, rol: 'ADMINISTRADOR' },
      select: { id: true, nombre: true, rol: true },
    });

    const nuevoParqueadero = await tx.parqueadero.create({
      data: parqueadero,
      select: { id: true },
    });

    await tx.personal.create({
      data: { usuarioId: nuevoUsuario.id, parqueaderoId: nuevoParqueadero.id },
    });

    await tx.consentimiento.create({
      data: { usuarioId: nuevoUsuario.id, versionPolitica },
    });

    await tx.bitacora.create({
      data: {
        usuarioId: nuevoUsuario.id,
        parqueaderoId: nuevoParqueadero.id,
        accion: 'REGISTRO_ADMINISTRADOR',
        entidad: 'Usuario',
        detalle: { ip, versionPolitica },
      },
    });

    return { ...nuevoUsuario, parqueaderoId: nuevoParqueadero.id };
  });
}

// HU-02: el cliente no tiene parqueadero ni Personal (RNF-02: parqueaderoId en null)
export function crearCliente({ usuario, versionPolitica, ip }) {
  return prisma.$transaction(async (tx) => {
    const nuevoUsuario = await tx.usuario.create({
      data: { ...usuario, rol: 'CLIENTE' },
      select: { id: true, nombre: true, rol: true },
    });

    await tx.consentimiento.create({
      data: { usuarioId: nuevoUsuario.id, versionPolitica },
    });

    await tx.bitacora.create({
      data: {
        usuarioId: nuevoUsuario.id,
        parqueaderoId: null,
        accion: 'REGISTRO_CLIENTE',
        entidad: 'Usuario',
        detalle: { ip, versionPolitica },
      },
    });

    return { ...nuevoUsuario, parqueaderoId: null };
  });
}