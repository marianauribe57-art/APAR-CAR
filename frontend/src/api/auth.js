import { solicitar, ErrorApi } from './cliente.js';
import * as mock from './mock.js';

// Día 2: borrar esta constante, el import de mock y las líneas "if (USAR_MOCK)"
const USAR_MOCK = true;

const extraerUsuario = (datos) => datos?.usuario ?? datos;

export async function registrarAdministrador(datos) {
  if (USAR_MOCK) return mock.registrarAdministrador(datos);
  return solicitar('/api/auth/registro-administrador', { metodo: 'POST', cuerpo: datos });
}

export async function registrarCliente(datos) {
  if (USAR_MOCK) return mock.registrarCliente(datos);
  return solicitar('/api/auth/registro-cliente', { metodo: 'POST', cuerpo: datos });
}

export async function iniciarSesion({ correo, contrasena }) {
  const datos = USAR_MOCK
    ? await mock.iniciarSesion({ correo, contrasena })
    : await solicitar('/api/auth/login', { metodo: 'POST', cuerpo: { correo, contrasena } });
  return extraerUsuario(datos);
}

export async function cerrarSesion() {
  if (USAR_MOCK) return mock.cerrarSesion();
  return solicitar('/api/auth/logout', { metodo: 'POST' });
}

// Devuelve el usuario o null si no hay sesión
export async function obtenerSesion() {
  try {
    const datos = USAR_MOCK ? await mock.obtenerSesion() : await solicitar('/api/auth/sesion');
    return extraerUsuario(datos);
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 401) return null;
    throw error;
  }
}