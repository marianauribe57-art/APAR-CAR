import { listarOperarios, crearOperario, desactivarOperario } from '../services/operarios.service.js';

// RNF-02: el parqueadero sale de la sesión, nunca del body
function contexto(req) {
  return {
    adminId: req.session.usuario.id,
    parqueaderoId: req.session.usuario.parqueaderoId,
    ip: req.ip,
  };
}

// GET /api/operarios
export async function getOperarios(req, res) {
  const operarios = await listarOperarios(contexto(req));
  res.json({ operarios });
}

// POST /api/operarios
export async function postOperario(req, res) {
  const resultado = await crearOperario(req.body ?? {}, contexto(req));
  res.status(resultado.status).json(resultado.cuerpo);
}

// PATCH /api/operarios/:id/desactivar
export async function patchDesactivarOperario(req, res) {
  const resultado = await desactivarOperario(req.params.id, contexto(req));
  if (resultado.status === 204) return res.status(204).end();
  res.status(resultado.status).json(resultado.cuerpo);
}
