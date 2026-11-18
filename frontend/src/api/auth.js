import { solicitar, ErrorApi } from './cliente.js';


// Solo para los registros: se borra en el PR de conectar-registro (#34 #35 #36)


const extraerUsuario = (datos) => datos?.usuario ?? datos;

export async function registrarAdministrador(datos) {
  return solicitar('/api/auth/registro-administrador', { metodo: 'POST', cuerpo: datos });
}

export async function registrarCliente(datos) {
  return solicitar('/api/auth/registro-cliente', { metodo: 'POST', cuerpo: datos });
}

export async function iniciarSesion({ correo, contrasena }) {
  const datos = await solicitar('/api/auth/iniciar-sesion', {
    metodo: 'POST',
    cuerpo: { correo, contrasena },
  });
  return extraerUsuario(datos);
}

export async function cerrarSesion() {
  return solicitar('/api/auth/cerrar-sesion', { metodo: 'POST' });
}

// Devuelve el usuario o null si no hay sesión
export async function obtenerSesion() {
  try {
    const datos = await solicitar('/api/auth/sesion');
    return extraerUsuario(datos);
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 401) return null;
    throw error;
  }
}