import { createContext, useContext } from 'react';

// Contexto separado del proveedor para que Vite Fast Refresh funcione
// (un archivo .jsx solo debe exportar componentes).
export const SesionContexto = createContext(null);

// Uso: const { usuario, cargando, iniciarSesion, cerrarSesion } = useSesion();
export function useSesion() {
  const valor = useContext(SesionContexto);
  if (!valor) {
    throw new Error('useSesion debe usarse dentro de <SesionProveedor>');
  }
  return valor;
}
