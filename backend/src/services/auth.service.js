import { verificarCredenciales, hashearContrasena } from './seguridad.service.js';
import { buscarUsuarioPorCorreo, crearAdministrador, crearCliente } from '../repositories/usuario.repository.js';
import { VERSION_POLITICA } from '../config/politica.js';

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

// ─── Registros (HU-01, HU-02, HU-35) ───

const MIN_CONTRASENA = 8;   // decisión de la PO (15 nov)
const MAX_BYTES_CONTRASENA = 72;   // bcrypt solo lee los primeros 72 bytes
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Si llega un texto, le quita los espacios de los bordes; si llega otra cosa, devuelve ''
function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// HU-02: revisa cada campo y devuelve un error por cada uno que falle
function validarRegistro(body, { esAdministrador }) {
  const datos = {
    nombre: texto(body.nombre),
    apellido: texto(body.apellido),
    correo: texto(body.correo).toLowerCase(),   // igual que en el login
    telefono: texto(body.telefono),
    contrasena: typeof body.contrasena === 'string' ? body.contrasena : '',   // la contraseña no se recorta
    nombreParqueadero: texto(body.nombreParqueadero),
    direccionParqueadero: texto(body.direccionParqueadero),
  };

  const campos = {};

  if (!datos.nombre) campos.nombre = 'Escribe tu nombre.';
  if (!datos.apellido) campos.apellido = 'Escribe tu apellido.';

  if (!datos.correo) campos.correo = 'Escribe tu correo.';
  else if (!FORMATO_CORREO.test(datos.correo)) campos.correo = 'El correo no tiene un formato válido.';

  if (!datos.telefono) campos.telefono = 'Escribe tu teléfono.';

  if (datos.contrasena.length < MIN_CONTRASENA) {
    campos.contrasena = `La contraseña debe tener al menos ${MIN_CONTRASENA} caracteres.`;
  } else if (Buffer.byteLength(datos.contrasena, 'utf8') > MAX_BYTES_CONTRASENA) {
    campos.contrasena = 'La contraseña es demasiado larga.';
  }

  // HU-35: aceptación explícita. Solo vale true, no "true" ni 1
  if (body.aceptaPolitica !== true) {
    campos.aceptaPolitica = 'Debes aceptar la política de tratamiento de datos.';
  }

  if (esAdministrador) {
    if (!datos.nombreParqueadero) campos.nombreParqueadero = 'Escribe el nombre del parqueadero.';
    if (!datos.direccionParqueadero) campos.direccionParqueadero = 'Escribe la dirección del parqueadero.';
  }

  return { datos, campos };
}

// HU-01 / RN-18: aquí sí se informa que el correo existe, y se ofrece recuperar la contraseña
const CORREO_REGISTRADO = {
  error: 'CORREO_REGISTRADO',
  mensaje: 'Ese correo ya está registrado. Si es tuyo, puedes recuperar tu contraseña.',
};

async function registrar(body, { ip, esAdministrador }) {
  const { datos, campos } = validarRegistro(body, { esAdministrador });

  if (Object.keys(campos).length > 0) {
    return {
      status: 400,
      cuerpo: { error: 'DATOS_INVALIDOS', mensaje: 'Revisa los campos marcados.', campos },
    };
  }

  if (await buscarUsuarioPorCorreo(datos.correo)) {
    return { status: 409, cuerpo: CORREO_REGISTRADO };
  }

  const usuario = {
    correo: datos.correo,
    nombre: `${datos.nombre} ${datos.apellido}`,   // decisión de la PO: el backend los une
    telefono: datos.telefono,
    hashContrasena: await hashearContrasena(datos.contrasena),
  };

  try {
    const creado = esAdministrador
      ? await crearAdministrador({
          usuario,
          parqueadero: { nombre: datos.nombreParqueadero, direccion: datos.direccionParqueadero },
          versionPolitica: VERSION_POLITICA,
          ip,
        })
      : await crearCliente({ usuario, versionPolitica: VERSION_POLITICA, ip });

    return { status: 201, usuario: creado };
  } catch (error) {
    // Dos registros con el mismo correo casi al mismo tiempo: el @unique de la base decide
    if (error.code === 'P2002') return { status: 409, cuerpo: CORREO_REGISTRADO };
    throw error;
  }
}

export function registrarAdministrador(body, { ip }) {
  return registrar(body, { ip, esAdministrador: true });
}

export function registrarCliente(body, { ip }) {
  return registrar(body, { ip, esAdministrador: false });
}