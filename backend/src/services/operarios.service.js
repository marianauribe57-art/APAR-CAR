import { hashearContrasena } from './seguridad.service.js';
import {
  buscarOperariosDelParqueadero,
  crearOperarioConPersonal,
  buscarOperarioDelParqueadero,
  marcarOperarioInactivo,
} from '../repositories/operarios.repository.js';

// Las mismas reglas de contraseña que en los registros (decisión de la PO, 15 nov)
const MIN_CONTRASENA = 8;
const MAX_BYTES_CONTRASENA = 72;   // bcrypt solo lee los primeros 72 bytes
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Escenario de error de HU-38: no se dice de qué parqueadero es el correo
const CORREO_EN_USO = {
  error: 'CORREO_EN_USO',
  mensaje: 'Ese correo no se puede usar. Prueba con otro.',
};

const NO_ENCONTRADO = {
  error: 'NO_ENCONTRADO',
  mensaje: 'No encontramos ese operario en tu parqueadero.',
};

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Devuelve un mensaje si la contraseña no sirve, o null si está bien
export function revisarContrasena(contrasena) {
  if (typeof contrasena !== 'string' || contrasena.length < MIN_CONTRASENA) {
    return `La contraseña debe tener al menos ${MIN_CONTRASENA} caracteres.`;
  }
  if (Buffer.byteLength(contrasena, 'utf8') > MAX_BYTES_CONTRASENA) {
    return 'La contraseña es demasiado larga.';
  }
  return null;
}

function validarOperario(body) {
  const datos = {
    nombre: texto(body.nombre),
    correo: texto(body.correo).toLowerCase(),
    telefono: texto(body.telefono),
    contrasenaInicial: body.contrasenaInicial,   // la contraseña no se recorta
  };

  const campos = {};

  if (!datos.nombre) campos.nombre = 'Escribe el nombre del operario.';

  if (!datos.correo) campos.correo = 'Escribe el correo del operario.';
  else if (!FORMATO_CORREO.test(datos.correo)) campos.correo = 'El correo no tiene un formato válido.';

  if (!datos.telefono) campos.telefono = 'Escribe el teléfono del operario.';

  const errorContrasena = revisarContrasena(datos.contrasenaInicial);
  if (errorContrasena) campos.contrasenaInicial = errorContrasena;

  // RN-08: el administrador declara que tiene la autorización del operario. Solo vale true
  if (body.declaraAutorizacion !== true) {
    campos.declaraAutorizacion = 'Debes declarar que tienes la autorización del operario para tratar sus datos.';
  }

  return { datos, campos };
}

// GET: solo los operarios de MI parqueadero
export function listarOperarios({ parqueaderoId }) {
  return buscarOperariosDelParqueadero(parqueaderoId);
}

// POST: Usuario + Personal + Bitácora, todo junto o nada
export async function crearOperario(body, { adminId, parqueaderoId, ip }) {
  const { datos, campos } = validarOperario(body);

  if (Object.keys(campos).length > 0) {
    return {
      status: 400,
      cuerpo: { error: 'DATOS_INVALIDOS', mensaje: 'Revisa los campos marcados.', campos },
    };
  }

  try {
    const operario = await crearOperarioConPersonal({
      usuario: {
        nombre: datos.nombre,
        correo: datos.correo,
        telefono: datos.telefono,
        hashContrasena: await hashearContrasena(datos.contrasenaInicial),
      },
      parqueaderoId,
      adminId,
      ip,
    });
    return { status: 201, cuerpo: { operario } };
  } catch (error) {
    // El correo es único en toda la plataforma (RN-18): lo frena el @unique de la base
    if (error.code === 'P2002') return { status: 409, cuerpo: CORREO_EN_USO };
    throw error;
  }
}

// PATCH: no se borra nada, así sus movimientos quedan (trazabilidad)
export async function desactivarOperario(operarioId, { adminId, parqueaderoId, ip }) {
  // Un id que ni siquiera es uuid haría fallar a Postgres: se responde 404 de una vez
  if (!FORMATO_UUID.test(operarioId ?? '')) return { status: 404, cuerpo: NO_ENCONTRADO };

  const operario = await buscarOperarioDelParqueadero(operarioId, parqueaderoId);
  if (!operario) return { status: 404, cuerpo: NO_ENCONTRADO };

  if (operario.activo) {
    await marcarOperarioInactivo({ operarioId, parqueaderoId, adminId, ip });
  }
  return { status: 204 };
}
