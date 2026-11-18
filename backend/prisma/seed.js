// Datos de prueba para aparcar-dev. Se puede correr varias veces (upsert).
// Uso: npx prisma db seed   (solo contra aparcar-dev, nunca contra la base de TICS)
import { prisma } from '../src/config/prisma.js';
import { hashearContrasena } from '../src/services/seguridad.service.js';
import { VERSION_POLITICA } from '../src/config/politica.js';

// Contraseña SOLO de demo, nunca una real
const CONTRASENA_DEMO = 'Demo.Aparcar1';

// Id fijo: Parqueadero no tiene un campo único, así el upsert siempre lo encuentra
const ID_PARQUEADERO_DEMO = '00000000-0000-4000-8000-000000000001';

const USUARIOS_DEMO = [
  { correo: 'admin@aparcar.demo', nombre: 'Admin Demo', telefono: '3000000001', rol: 'ADMINISTRADOR' },
  { correo: 'operario@aparcar.demo', nombre: 'Operario Demo', telefono: '3000000002', rol: 'OPERARIO' },
  { correo: 'cliente@aparcar.demo', nombre: 'Cliente Demo', telefono: '3000000003', rol: 'CLIENTE' },
];

async function main() {
  const parqueadero = await prisma.parqueadero.upsert({
    where: { id: ID_PARQUEADERO_DEMO },
    update: {},
    create: { id: ID_PARQUEADERO_DEMO, nombre: 'Parqueadero Demo', direccion: 'Calle Falsa 123' },
  });

  const hashContrasena = await hashearContrasena(CONTRASENA_DEMO);

  for (const datos of USUARIOS_DEMO) {
    const usuario = await prisma.usuario.upsert({
      where: { correo: datos.correo },
      // Si ya existe, lo deja listo para probar: activo y sin bloqueo
      update: { activo: true, intentosFallidos: 0, bloqueadoHasta: null },
      create: { ...datos, hashContrasena },
    });

    // Administrador y operario van ligados al parqueadero; el cliente no
    if (datos.rol !== 'CLIENTE') {
      await prisma.personal.upsert({
        where: { usuarioId: usuario.id },
        update: {},
        create: { usuarioId: usuario.id, parqueaderoId: parqueadero.id },
      });
    }

    const yaAcepto = await prisma.consentimiento.findFirst({ where: { usuarioId: usuario.id } });
    if (!yaAcepto) {
      await prisma.consentimiento.create({
        data: { usuarioId: usuario.id, versionPolitica: VERSION_POLITICA },
      });
    }

    console.log(`✔ ${datos.rol.padEnd(13)} ${datos.correo}`);
  }
}

main()
  .catch((error) => {
    console.error('✖ El seed falló:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());