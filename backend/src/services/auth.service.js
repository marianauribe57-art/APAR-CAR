import { verificarCredenciales } from './seguridad.service.js';

// RN-09: el mismo mensaje si falla el correo o la contraseña
const MENSAJE_GENERICO = 'Correo o contraseña incorrectos.';

// HU-03: traduce el resultado de seguridad.service a la respuesta de la API
export async function iniciarSesion({ correo, contrasena, ip }) {
  const resultado = await verificarCredenciales(correo, contrasena, { ip });

  if (resultado.ok) {
    return { status: 200, usuario: resultado.usuario };
  }

  // RNF-01: bloqueo de 15 min tras 5 intentos
  if (resultado.motivo === 'CUENTA_BLOQUEADA') {
    return {
      status: 423,
      cuerpo: {
        error: 'CUENTA_BLOQUEADA',
        mensaje: `Cuenta bloqueada. Intenta de nuevo en ${resultado.minutosRestantes} minutos.`,
        minutosRestantes: resultado.minutosRestantes,
      },
    };
  }

  return {
    status: 401,
    cuerpo: { error: 'CREDENCIALES_INVALIDAS', mensaje: MENSAJE_GENERICO },
  };
}