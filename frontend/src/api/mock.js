// Respuestas falsas mientras el backend no existe. Día 2: borrar este archivo.
// Usuarios de prueba (contraseña: Demo1234):
//   admin@demo.com (ADMINISTRADOR) · operario@demo.com (OPERARIO)
//   cliente@demo.com (CLIENTE)     · bloqueado@demo.com (responde 423)
import { ErrorApi } from './cliente.js';

const CLAVE_SESION = 'mock_sesion';
const CONTRASENA_DEMO = 'Demo1234';

const usuarios = [
  { id: 1, nombre: 'Ana Administradora', correo: 'admin@demo.com', rol: 'ADMINISTRADOR' },
  { id: 2, nombre: 'Oscar Operario', correo: 'operario@demo.com', rol: 'OPERARIO' },
  { id: 3, nombre: 'Clara Cliente', correo: 'cliente@demo.com', rol: 'CLIENTE' },
  { id: 4, nombre: 'Bruno Bloqueado', correo: 'bloqueado@demo.com', rol: 'CLIENTE' },
];

const espera = (ms = 400) => new Promise((resolver) => setTimeout(resolver, ms));

function leerSesion() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
}

function guardarSesion(usuario) {
  try {
    if (usuario) sessionStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
    else sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // sin almacenamiento disponible: la sesión simulada se pierde al recargar
  }
}

export async function iniciarSesion({ correo, contrasena }) {
  await espera();
  const usuario = usuarios.find((u) => u.correo === correo.trim().toLowerCase());

  if (usuario?.correo === 'bloqueado@demo.com') {
    throw new ErrorApi(423, { error: 'CUENTA_BLOQUEADA', mensaje: 'Cuenta bloqueada', minutosRestantes: 14 });
  }
  if (!usuario || contrasena !== (usuario.contrasena ?? CONTRASENA_DEMO)) {
    throw new ErrorApi(401, { error: 'CREDENCIALES_INVALIDAS', mensaje: 'Credenciales inválidas' });
  }
  const sinContrasena = { ...usuario };
  delete sinContrasena.contrasena;
  guardarSesion(sinContrasena);
  return { usuario: sinContrasena };
}

export async function cerrarSesion() {
  await espera(150);
  guardarSesion(null);
  return null;
}

export async function obtenerSesion() {
  await espera(150);
  const usuario = leerSesion();
  if (!usuario) throw new ErrorApi(401, { error: 'SIN_SESION', mensaje: 'Sin sesión' });
  return { usuario };
}

// Campos obligatorios (decisión de PO: teléfono en ambos registros y
// dirección del parqueadero en el de administrador)
const OBLIGATORIOS_CLIENTE = ['nombre', 'apellido', 'correo', 'contrasena', 'telefono', 'versionPolitica'];
const OBLIGATORIOS_ADMINISTRADOR = [
  ...OBLIGATORIOS_CLIENTE,
  'nombreParqueadero',
  'direccionParqueadero',
];

function registrar(datos, rol, obligatorios) {
  const faltante = obligatorios.find((campo) => !String(datos[campo] ?? '').trim());
  if (faltante) {
    throw new ErrorApi(400, { error: 'DATOS_INVALIDOS', mensaje: `Falta el campo ${faltante}` });
  }
  if (datos.aceptaPolitica !== true) {
    throw new ErrorApi(400, { error: 'DATOS_INVALIDOS', mensaje: 'Debes aceptar la política de datos' });
  }
  const correo = datos.correo.trim().toLowerCase();
  if (usuarios.some((u) => u.correo === correo)) {
    throw new ErrorApi(409, { error: 'CORREO_REGISTRADO', mensaje: 'El correo ya está registrado' });
  }
  usuarios.push({
    id: usuarios.length + 1,
    nombre: `${datos.nombre} ${datos.apellido}`,
    correo,
    rol,
    contrasena: datos.contrasena, // solo en el mock, para poder iniciar sesión después
  });
  return { mensaje: 'Cuenta creada' };
}

export async function registrarAdministrador(datos) {
  await espera();
  return registrar(datos, 'ADMINISTRADOR', OBLIGATORIOS_ADMINISTRADOR);
}

export async function registrarCliente(datos) {
  await espera();
  return registrar(datos, 'CLIENTE', OBLIGATORIOS_CLIENTE);
}