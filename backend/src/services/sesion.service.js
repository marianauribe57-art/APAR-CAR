import bcrypt from 'bcrypt';
import { hashearContrasena } from './seguridad.service.js';
import { revisarContrasena } from './operarios.service.js';
import { buscarUsuarioParaPrimerIngreso, completarPrimerIngreso } from '../repositories/sesion.repository.js';
import { VERSION_POLITICA } from '../config/politica.js';

// HU-38: primer ingreso del operario (sirve para cualquier rol con debeCambiarContrasena)
export async function registrarPrimerIngreso(body, { usuarioId, ip }) {
  const usuario = await buscarUsuarioParaPrimerIngreso(usuarioId);

  if (!usuario || !usuario.activo) {
    return { status: 401, cuerpo: { error: 'SIN_SESION', mensaje: 'Debes iniciar sesión.' } };
  }

  if (!usuario.debeCambiarContrasena) {
    return {
      status: 400,
      cuerpo: { error: 'PRIMER_INGRESO_NO_REQUERIDO', mensaje: 'Tu cuenta ya completó el primer ingreso.' },
    };
  }

  const campos = {};

  // HU-35 / RN-08: aceptación explícita. Solo vale true
  if (body.aceptaPolitica !== true) {
    campos.aceptaPolitica = 'Debes aceptar la política de tratamiento de datos.';
  }

  const errorContrasena = revisarContrasena(body.contrasenaNueva);
  if (errorContrasena) {
    campos.contrasenaNueva = errorContrasena;
  } else if (await bcrypt.compare(body.contrasenaNueva, usuario.hashContrasena)) {
    campos.contrasenaNueva = 'La contraseña nueva debe ser distinta a la que te dio el administrador.';
  }

  if (Object.keys(campos).length > 0) {
    return {
      status: 400,
      cuerpo: { error: 'DATOS_INVALIDOS', mensaje: 'Revisa los campos marcados.', campos },
    };
  }

  // La versión de la política sale del backend, no del frontend (igual que en los registros)
  await completarPrimerIngreso({
    usuarioId,
    parqueaderoId: usuario.personal?.parqueaderoId ?? null,
    hashContrasena: await hashearContrasena(body.contrasenaNueva),
    versionPolitica: VERSION_POLITICA,
    ip,
  });

  return { status: 204 };
}
