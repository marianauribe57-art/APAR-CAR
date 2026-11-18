import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const PgStore = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
  throw new Error('Falta SESSION_SECRET en el .env');
}

const esProduccion = process.env.NODE_ENV === 'production';

// RNF-01: expiración por inactividad según el rol (decisión del equipo, 14 nov)
const MINUTO = 60 * 1000;

export const DURACION_SESION = {
  OPERARIO: 120 * MINUTO,
  ADMINISTRADOR: 30 * MINUTO,
  CLIENTE: 15 * MINUTO,
};

// Se llama en el login (día 2), justo después de guardar req.session.usuario
export function aplicarDuracionPorRol(req, rol) {
  const ms = DURACION_SESION[rol] ?? DURACION_SESION.CLIENTE;
  req.session.cookie.originalMaxAge = ms;  // sin esto, rolling la devuelve al valor por defecto
  req.session.cookie.maxAge = ms;
}

export const sesion = session({
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    tableName: 'session',          // la tabla que creó Prisma en el #29
    createTableIfMissing: false,   // Prisma es el dueño de la tabla, no la librería
  }),
  name: 'aparcar.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,        // solo se guarda sesión cuando alguien inicia sesión
  rolling: true,
  cookie: {
    httpOnly: true,                // JavaScript del navegador no puede leerla
    sameSite: 'lax',
    secure: esProduccion,          // solo por HTTPS en Vercel
    maxAge: DURACION_SESION.CLIENTE,   // por defecto el más corto; el login lo ajusta por rol
  },
});