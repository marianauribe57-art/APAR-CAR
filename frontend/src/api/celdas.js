import { solicitar } from './cliente.js';

// GET /api/celdas → { celdas: [...], totales: { libres, ocupadas } }
export function listarCeldas() {
  return solicitar('/api/celdas');
}

// POST /api/celdas → una celda
export function crearCelda({ codigo, tipoPermitido }) {
  return solicitar('/api/celdas', {
    metodo: 'POST',
    cuerpo: { codigo, tipoPermitido },
  });
}

// POST /api/celdas/lote → varias celdas: prefijo A + cantidad 3 = A-01, A-02, A-03
export function crearCeldasEnLote({ prefijo, cantidad, tipoPermitido }) {
  return solicitar('/api/celdas/lote', {
    metodo: 'POST',
    cuerpo: { prefijo, cantidad, tipoPermitido },
  });
}