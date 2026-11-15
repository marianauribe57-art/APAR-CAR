import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';

// Prisma "de mentira": las pruebas nunca tocan la base de datos
vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    usuario: { findUnique: vi.fn(), update: vi.fn() },
    bitacora: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from '../src/config/prisma.js';
import { hashearContrasena, verificarCredenciales } from '../src/services/seguridad.service.js';

let hashCorrecto;

beforeAll(async () => {
  hashCorrecto = await hashearContrasena('Correcta123');
});

beforeEach(() => {
  vi.clearAllMocks();
});

function usuarioDePrueba(cambios = {}) {
  return {
    id: 'u-1',
    nombre: 'Ana',
    rol: 'ADMINISTRADOR',
    activo: true,
    hashContrasena: hashCorrecto,
    intentosFallidos: 0,
    bloqueadoHasta: null,
    debeCambiarContrasena: false,
    ...cambios,
  };
}

describe('hashearContrasena', () => {
  it('nunca guarda la contraseña en texto plano y el hash se puede verificar', async () => {
    expect(hashCorrecto).not.toBe('Correcta123');
    expect(await bcrypt.compare('Correcta123', hashCorrecto)).toBe(true);
    expect(await bcrypt.compare('Otra123', hashCorrecto)).toBe(false);
  });
});

describe('verificarCredenciales', () => {
  it('con la contraseña correcta deja entrar', async () => {
    prisma.usuario.findUnique.mockResolvedValue(usuarioDePrueba());

    const resultado = await verificarCredenciales('ana@demo.com', 'Correcta123');

    expect(resultado.ok).toBe(true);
    expect(resultado.usuario.rol).toBe('ADMINISTRADOR');
  });

  it('si el correo no existe responde el mismo error genérico', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    const resultado = await verificarCredenciales('nadie@demo.com', 'Lo que sea');

    expect(resultado).toEqual({ ok: false, motivo: 'CREDENCIALES_INVALIDAS' });
  });

  it('el 4.º intento fallido todavía no bloquea', async () => {
    prisma.usuario.findUnique.mockResolvedValue(usuarioDePrueba({ intentosFallidos: 3 }));

    const resultado = await verificarCredenciales('ana@demo.com', 'Mala123');

    expect(resultado).toEqual({ ok: false, motivo: 'CREDENCIALES_INVALIDAS' });
    expect(prisma.usuario.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { intentosFallidos: 4 } }),
    );
  });

  it('el 5.º intento fallido bloquea la cuenta 15 minutos', async () => {
    prisma.usuario.findUnique.mockResolvedValue(usuarioDePrueba({ intentosFallidos: 4 }));

    const resultado = await verificarCredenciales('ana@demo.com', 'Mala123');

    expect(resultado).toEqual({ ok: false, motivo: 'CUENTA_BLOQUEADA', minutosRestantes: 15 });
  });

  it('una cuenta bloqueada informa los minutos que le faltan', async () => {
    const enDiezMinutos = new Date(Date.now() + 10 * 60000);
    prisma.usuario.findUnique.mockResolvedValue(usuarioDePrueba({ bloqueadoHasta: enDiezMinutos }));

    const resultado = await verificarCredenciales('ana@demo.com', 'Correcta123');

    expect(resultado).toEqual({ ok: false, motivo: 'CUENTA_BLOQUEADA', minutosRestantes: 10 });
  });
});