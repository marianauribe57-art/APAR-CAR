// A dónde va cada rol después del login. Los nombres son los del enum Rol de Prisma.
export const RUTA_INICIO_POR_ROL = {
  ADMINISTRADOR: '/panel',
  OPERARIO: '/operacion',
  CLIENTE: '/mi-cuenta',
};

export function rutaInicioPorRol(rol) {
  return RUTA_INICIO_POR_ROL[rol] ?? '/auth';
}
