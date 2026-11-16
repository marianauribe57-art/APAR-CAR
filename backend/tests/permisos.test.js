import { describe, it, expect, vi, beforeEach } from 'vitest';

// Prisma "de mentira": las pruebas nunca tocan la base de datos
vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    usuario: { findUnique: vi.fn() },
    bitacora: { create: vi.fn() },
  },
}));

import { prisma } from '../src/config/prisma.js';
import { requiereRol } from '../src/middlewares/session.middleware.js';

function crearRespuesta() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

function peticionDeOperario() {
  return {
    method: 'GET',
    originalUrl: '/api/tarifas',
    ip: '127.0.0.1',
    session: { usuario: { id: 'op-1' } },
  };
}

const OPERARIO = {
  rol: 'OPERARIO',
  activo: true,
  debeCambiarContrasena: false,
  personal: { parqueaderoId: 'parq-1' },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('requiereRol · panel del operario (HU-39)', () => {
  it('un operario en una ruta de administrador recibe 403 ACCESO_DENEGADO', async () => {
    prisma.usuario.findUnique.mockResolvedValue(OPERARIO);
    const res = crearRespuesta();
    const next = vi.fn();

    await requiereRol('ADMINISTRADOR')(peticionDeOperario(), res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'ACCESO_DENEGADO' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('el intento queda en la bitácora con la ruta, el usuario y su parqueadero', async () => {
    prisma.usuario.findUnique.mockResolvedValue(OPERARIO);

    await requiereRol('ADMINISTRADOR')(peticionDeOperario(), crearRespuesta(), vi.fn());

    expect(prisma.bitacora.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        usuarioId: 'op-1',
        parqueaderoId: 'parq-1',
        accion: 'ACCESO_DENEGADO',
        detalle: expect.objectContaining({ metodo: 'GET', ruta: '/api/tarifas' }),
      }),
    });
  });

  it('si la bitácora falla, igual responde 403', async () => {
    prisma.usuario.findUnique.mockResolvedValue(OPERARIO);
    prisma.bitacora.create.mockRejectedValue(new Error('falló la base'));
    const res = crearRespuesta();

    await requiereRol('ADMINISTRADOR')(peticionDeOperario(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('con el rol correcto deja pasar y no escribe en la bitácora', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ ...OPERARIO, rol: 'ADMINISTRADOR' });
    const next = vi.fn();

    await requiereRol('ADMINISTRADOR')(peticionDeOperario(), crearRespuesta(), next);

    expect(next).toHaveBeenCalled();
    expect(prisma.bitacora.create).not.toHaveBeenCalled();
  });
});
