import { solicitar } from './cliente.js';

// HU-38: operarios de MI parqueadero (el backend saca el parqueadero de la sesión)
export async function listarOperarios() {
  const datos = await solicitar('/api/operarios');
  return datos?.operarios ?? [];
}

// cuerpo: { nombre, correo, telefono, contrasenaInicial, declaraAutorizacion: true }
export async function crearOperario(cuerpo) {
  const datos = await solicitar('/api/operarios', { metodo: 'POST', cuerpo });
  return datos?.operario;
}

export function desactivarOperario(id) {
  return solicitar(`/api/operarios/${id}/desactivar`, { metodo: 'PATCH' });
}

// HU-38: primer ingreso. La versión de la política la pone el backend
export function completarPrimerIngreso({ aceptaPolitica, contrasenaNueva }) {
  return solicitar('/api/auth/primer-ingreso', {
    metodo: 'POST',
    cuerpo: { aceptaPolitica, contrasenaNueva },
  });
}
