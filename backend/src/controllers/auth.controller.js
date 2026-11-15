import { iniciarSesion } from '../services/auth.service.js';
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