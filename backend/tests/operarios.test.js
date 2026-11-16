import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Prisma "de mentira": las pruebas nunca tocan la base de datos
vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    usuario: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    bitacora: { create: vi.fn() },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from '../src/config/prisma.js';
import app from '../src/app.js';
import { crearOperario, desactivarOperario } from '../src/services/operarios.service.js';
import { requiereRol } from '../src/middlewares/session.middleware.js';

const CONTEXTO = { adminId: 'admin-1', parqueaderoId: 'parq-1', ip: '127.0.0.1' };

function cuerpoValido(cambios = {}) {
  return {
    nombre: 'Pedro Operario',
    correo: 'pedro@correo.com',
    telefono: '3001234567',
    contrasenaInicial: 'Inicial123',
    declaraAutorizacion: true,
    ...cambios,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Rutas de operarios sin sesión (HU-38)', () => {
  it('GET /api/operarios responde 401', async () => {
    const respuesta = await request(app).get('/api/operarios');
    expect(respuesta.status).toBe(401);
    expect(respuesta.body.error).toBe('SIN_SESION');
  });

  it('POST /api/operarios responde 401', async () => {
    const respuesta = await request(app).post('/api/operarios').send(cuerpoValido());
    expect(respuesta.status).toBe(401);
  });

  it('PATCH /api/operarios/:id/desactivar responde 401', async () => {
    const respuesta = await request(app).patch('/api/operarios/123/desactivar');
    expect(respuesta.status).toBe(401);
  });

  it('POST /api/auth/primer-ingreso responde 401', async () => {
    const respuesta = await request(app).post('/api/auth/primer-ingreso').send({});
    expect(respuesta.status).toBe(401);
  });
});

describe('crearOperario (HU-38)', () => {
  it('sin declaraAutorizacion responde 400 y no toca la base (RN-08)', async () => {
    const { declaraAutorizacion, ...sinDeclaracion } = cuerpoValido();

    const resultado = await crearOperario(sinDeclaracion, CONTEXTO);

    expect(resultado.status).toBe(400);
    expect(resultado.cuerpo.campos.declaraAutorizacion).toBeDefined();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('declaraAutorizacion en "true" (texto) tampoco vale', async () => {
    const resultado = await crearOperario(cuerpoValido({ declaraAutorizacion: 'true' }), CONTEXTO);
    expect(resultado.status).toBe(400);
  });

  it('una contraseña inicial corta responde 400', async () => {
    const resultado = await crearOperario(cuerpoValido({ contrasenaInicial: '123' }), CONTEXTO);
    expect(resultado.status).toBe(400);
    expect(resultado.cuerpo.campos.contrasenaInicial).toBeDefined();
  });

  it('correo repetido responde 409 CORREO_EN_USO sin decir de qué parqueadero es', async () => {
    prisma.$transaction.mockRejectedValue(Object.assign(new Error('unique'), { code: 'P2002' }));

    const resultado = await crearOperario(cuerpoValido(), CONTEXTO);

    expect(resultado.status).toBe(409);
    expect(resultado.cuerpo.error).toBe('CORREO_EN_USO');
    expect(JSON.stringify(resultado.cuerpo)).not.toMatch(/parqueadero/i);
  });

  it('datos válidos responden 201 con el operario', async () => {
    const operario = { id: 'op-1', nombre: 'Pedro Operario', activo: true };
    prisma.$transaction.mockResolvedValue(operario);

    const resultado = await crearOperario(cuerpoValido(), CONTEXTO);

    expect(resultado.status).toBe(201);
    expect(resultado.cuerpo.operario).toEqual(operario);
  });
});

describe('desactivarOperario (HU-38)', () => {
  const ID = '11111111-2222-3333-4444-555555555555';

  it('si no es de mi parqueadero responde 404', async () => {
    prisma.usuario.findFirst.mockResolvedValue(null);

    const resultado = await desactivarOperario(ID, CONTEXTO);

    expect(resultado.status).toBe(404);
    expect(prisma.usuario.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ personal: { parqueaderoId: 'parq-1' } }),
      }),
    );
  });

  it('un id que no es uuid responde 404 sin consultar la base', async () => {
    const resultado = await desactivarOperario('abc', CONTEXTO);
    expect(resultado.status).toBe(404);
    expect(prisma.usuario.findFirst).not.toHaveBeenCalled();
  });

  it('si es de mi parqueadero responde 204', async () => {
    prisma.usuario.findFirst.mockResolvedValue({ id: ID, activo: true });
    prisma.$transaction.mockResolvedValue([]);

    const resultado = await desactivarOperario(ID, CONTEXTO);

    expect(resultado.status).toBe(204);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});

describe('requiereRol con debeCambiarContrasena (HU-38)', () => {
  function crearRespuesta() {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
  }

  it('responde 403 CAMBIO_CONTRASENA_REQUERIDO mientras no cambie la contraseña', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ rol: 'OPERARIO', activo: true, debeCambiarContrasena: true });
    const req = { session: { usuario: { id: 'op-1' } } };
    const res = crearRespuesta();
    const next = vi.fn();

    await requiereRol('OPERARIO')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'CAMBIO_CONTRASENA_REQUERIDO' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('deja pasar cuando ya cambió la contraseña', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ rol: 'OPERARIO', activo: true, debeCambiarContrasena: false });
    const req = { session: { usuario: { id: 'op-1' } } };
    const next = vi.fn();

    await requiereRol('OPERARIO')(req, crearRespuesta(), next);

    expect(next).toHaveBeenCalled();
  });
});
