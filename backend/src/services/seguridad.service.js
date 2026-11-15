import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';

// Reglas de seguridad (revísalas contra la HU-46 / los RNF)
const RONDAS_BCRYPT = 12;
const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

// Hash falso para que "el correo no existe" tarde lo mismo que "contraseña mala"
const HASH_FALSO = bcrypt.hashSync('contrasena-falsa', RONDAS_BCRYPT);

// Para los registros del día 2 (HU-01, HU-02)
export function hashearContrasena(contrasena) {
  return bcrypt.hash(contrasena, RONDAS_BCRYPT);
}

// Bitácora: solo se inserta, nunca se actualiza (RNF-07)
function registrarEnBitacora({ usuarioId = null, parqueaderoId = null, accion, detalle = {} }) {
  return prisma.bitacora.create({
    data: { usuarioId, parqueaderoId, accion, entidad: 'Usuario', detalle },
  });
}

// Para el login del día 2 (HU-03)
export async function verificarCredenciales(correo, contrasena, { ip } = {}) {
  const ahora = new Date();
  const usuario = await prisma.usuario.findUnique({
    where: { correo },
    include: { personal: { select: { parqueaderoId: true } } },
  });

  // Clientes y correos que no existen → null (RNF-02: sale de la base, nunca del cliente)
  const parqueaderoId = usuario?.personal?.parqueaderoId ?? null;

  // 1. No existe o está inactivo → la misma respuesta genérica
  if (!usuario || !usuario.activo) {
    await bcrypt.compare(contrasena, HASH_FALSO);
    await registrarEnBitacora({
      usuarioId: usuario?.id ?? null,
      parqueaderoId,
      accion: 'LOGIN_FALLIDO',
      detalle: { correo, ip, motivo: usuario ? 'INACTIVO' : 'NO_EXISTE' },
    });
    return { ok: false, motivo: 'CREDENCIALES_INVALIDAS' };
  }

  // 2. Está bloqueado → ni siquiera se revisa la contraseña
  if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > ahora) {
    const minutosRestantes = Math.ceil((usuario.bloqueadoHasta - ahora) / 60000);
    await registrarEnBitacora({
      usuarioId: usuario.id,
      parqueaderoId,
      accion: 'LOGIN_RECHAZADO_POR_BLOQUEO',
      detalle: { ip },
    });
    return { ok: false, motivo: 'CUENTA_BLOQUEADA', minutosRestantes };
  }

  const coincide = await bcrypt.compare(contrasena, usuario.hashContrasena);

  // 3. Contraseña incorrecta → suma un intento y bloquea al llegar al máximo
  if (!coincide) {
    const intentos = usuario.intentosFallidos + 1;
    const seBloquea = intentos >= MAX_INTENTOS;

    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuario.id },
        data: seBloquea
          ? { intentosFallidos: 0, bloqueadoHasta: new Date(ahora.getTime() + MINUTOS_BLOQUEO * 60000) }
          : { intentosFallidos: intentos },
      }),
      registrarEnBitacora({
        usuarioId: usuario.id,
        parqueaderoId,
        accion: seBloquea ? 'CUENTA_BLOQUEADA' : 'LOGIN_FALLIDO',
        detalle: { ip, intentos },
      }),
    ]);

    return seBloquea
      ? { ok: false, motivo: 'CUENTA_BLOQUEADA', minutosRestantes: MINUTOS_BLOQUEO }
      : { ok: false, motivo: 'CREDENCIALES_INVALIDAS' };
  }

  // 4. Todo bien → reinicia el contador y registra la entrada
  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: usuario.id },
      data: { intentosFallidos: 0, bloqueadoHasta: null },
    }),
    registrarEnBitacora({ usuarioId: usuario.id, parqueaderoId, accion: 'LOGIN_EXITOSO', detalle: { ip } }),
  ]);

  return {
    ok: true,
    usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol, parqueaderoId },
    debeCambiarContrasena: usuario.debeCambiarContrasena,
  };
}