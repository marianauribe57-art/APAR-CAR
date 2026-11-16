import { iniciarSesion, registrarAdministrador, registrarCliente } from '../services/auth.service.js';
import { aplicarDuracionPorRol } from '../config/sesion.js';

// regenerate() funciona con callback; esto lo convierte en promesa para poder usar await
function regenerarSesion(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

// POST /api/auth/iniciar-sesion (HU-03)
export async function postIniciarSesion(req, res) {
  const { correo, contrasena } = req.body ?? {};

  // No confiamos en el frontend: validamos aquí también
  if (typeof correo !== 'string' || typeof contrasena !== 'string' || !correo.trim() || !contrasena) {
    return res.status(400).json({
      error: 'DATOS_INCOMPLETOS',
      mensaje: 'Escribe tu correo y tu contraseña.',
    });
  }

  const resultado = await iniciarSesion({
    correo: correo.trim().toLowerCase(),
    contrasena,
    ip: req.ip,
  });

  if (resultado.status !== 200) {
    return res.status(resultado.status).json(resultado.cuerpo);
  }

  // Contra el robo de sesión (session fixation): sesión nueva al entrar
  await regenerarSesion(req);
  req.session.usuario = resultado.usuario; // { id, nombre, rol, parqueaderoId }
  aplicarDuracionPorRol(req, resultado.usuario.rol); // RNF-01

  res.status(200).json({ usuario: resultado.usuario });
}

// GET /api/auth/sesion: si no hay sesión, requiereSesion ya respondió 401
export function getSesion(req, res) {
  res.json({ usuario: req.session.usuario });
}

// Después del registro NO se inicia sesión: la persona va al login (plan del día 2)
function responderRegistro(res, resultado) {
  if (resultado.status !== 201) {
    return res.status(resultado.status).json(resultado.cuerpo);
  }
  res.status(201).json({
    usuario: resultado.usuario,
    mensaje: 'Cuenta creada. Ya puedes iniciar sesión.',
  });
}

// POST /api/auth/registro-administrador (HU-01)
export async function postRegistroAdministrador(req, res) {
  const resultado = await registrarAdministrador(req.body ?? {}, { ip: req.ip });
  responderRegistro(res, resultado);
}

// POST /api/auth/registro-cliente (HU-02)
export async function postRegistroCliente(req, res) {
  const resultado = await registrarCliente(req.body ?? {}, { ip: req.ip });
  responderRegistro(res, resultado);
}