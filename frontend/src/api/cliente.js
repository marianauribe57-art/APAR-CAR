// Cliente HTTP base. Rutas relativas (/api/...): el proxy de Vite (local) y
// vercel.json (producción) las reenvían al backend.

export class ErrorApi extends Error {
  constructor(estado, datos) {
    super(datos?.mensaje ?? `Error ${estado}`);
    this.name = 'ErrorApi';
    this.estado = estado; // 0 = sin conexión con el servidor
    this.datos = datos;
  }

  // 423 (cuenta bloqueada): el backend envía minutosRestantes en el cuerpo
  get minutosRestantes() {
    return this.datos?.minutosRestantes ?? null;
  }
}

let manejadorSesionInvalida = null;

// SesionContexto lo registra para limpiar el usuario cuando llega un 401
export function registrarManejadorSesionInvalida(manejador) {
  manejadorSesionInvalida = manejador;
}

// En estas rutas un 401 es una respuesta esperada, no una sesión vencida
const RUTAS_SIN_REDIRECCION = ['/api/auth/iniciar-sesion', '/api/auth/sesion'];

async function leerJson(respuesta) {
  try {
    return await respuesta.json();
  } catch {
    return null; // 204 o cuerpo vacío
  }
}

export async function solicitar(ruta, { metodo = 'GET', cuerpo } = {}) {
  const opciones = {
    method: metodo,
    credentials: 'include',
    headers: { Accept: 'application/json' },
  };
  if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }

  let respuesta;
  try {
    respuesta = await fetch(ruta, opciones);
  } catch {
    throw new ErrorApi(0, { mensaje: 'Sin conexión con el servidor' });
  }

  const datos = await leerJson(respuesta);

  if (!respuesta.ok) {
    // 401: sin sesión -> RutaProtegida redirige a /auth
    if (
      respuesta.status === 401 &&
      manejadorSesionInvalida &&
      !RUTAS_SIN_REDIRECCION.includes(ruta)
    ) {
      manejadorSesionInvalida();
    }
    // HU-38: el operario todavía no cambia su contraseña inicial -> al primer ingreso
    if (
      respuesta.status === 403 &&
      datos?.error === 'CAMBIO_CONTRASENA_REQUERIDO' &&
      window.location.pathname !== '/primer-ingreso'
    ) {
      window.location.assign('/primer-ingreso');
    }
    // 403 y 423 llegan como ErrorApi; cada pantalla decide qué mostrar
    throw new ErrorApi(respuesta.status, datos);
  }
  return datos;
}