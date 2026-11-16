import { describe, it, expect, vi } from 'vitest';
import { cerrarSesion } from '../src/controllers/sesion.controller.js';

// Respuesta falsa: guarda lo que el controlador le pide
function crearRespuesta() {
  const res = {};
  res.clearCookie = vi.fn(() => res);
  res.status = vi.fn(() => res);
  res.end = vi.fn(() => res);
  return res;
}

describe('cerrarSesion (HU-04)', () => {
  it('destruye la sesión, borra la cookie y responde 204', () => {
    const req = { session: { destroy: vi.fn((cb) => cb()) } };
    const res = crearRespuesta();
    const next = vi.fn();

    cerrarSesion(req, res, next);

    expect(req.session.destroy).toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalledWith('aparcar.sid');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(next).not.toHaveBeenCalled();
  });

  it('si falla al destruir la sesión, pasa el error a next', () => {
    const error = new Error('falló la base');
    const req = { session: { destroy: vi.fn((cb) => cb(error)) } };
    const res = crearRespuesta();
    const next = vi.fn();

    cerrarSesion(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});