// Validaciones del lado del cliente. El backend vuelve a validar todo.
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO = /^[0-9+\s-]{7,15}$/;
export const LARGO_MINIMO_CONTRASENA = 8;

// Versión de la política de tratamiento de datos que acepta el usuario (HU-35).
// Confirmar el valor con el equipo; el backend la guarda junto con la aceptación.
export const VERSION_POLITICA = '1.0';

export function validarRegistro(datos, { esAdministrador }) {
  const errores = {};
  if (!datos.nombre.trim()) errores.nombre = 'Escribe tu nombre.';
  if (!CORREO.test(datos.correo.trim())) errores.correo = 'Escribe un correo válido.';
  if (datos.contrasena.length < LARGO_MINIMO_CONTRASENA) {
    errores.contrasena = `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  }
  if (!TELEFONO.test(datos.telefono.trim())) errores.telefono = 'Escribe un teléfono válido.';
  if (esAdministrador) {
    if (!datos.nombreParqueadero.trim()) {
      errores.nombreParqueadero = 'Escribe el nombre del parqueadero.';
    }
    if (!datos.direccionParqueadero.trim()) {
      errores.direccionParqueadero = 'Escribe la dirección del parqueadero.';
    }
  }
  if (!datos.aceptaPolitica) {
    errores.aceptaPolitica = 'Debes aceptar la política de datos para crear la cuenta.';
  }
  return errores;
}

// Mensaje para errores de la API que no tienen manejo propio
export function mensajeErrorGeneral(error) {
  if (error?.estado === 0) return 'No hay conexión con el servidor. Intenta de nuevo.';
  if (error?.estado === 409) return 'Ese correo ya está registrado.';
  if (error?.estado === 400 && error.datos?.mensaje) return error.datos.mensaje;
  return 'Ocurrió un error. Intenta de nuevo en unos minutos.';
}
