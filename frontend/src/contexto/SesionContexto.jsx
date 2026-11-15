import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cerrarSesion as apiCerrarSesion,
  iniciarSesion as apiIniciarSesion,
  obtenerSesion,
} from '../api/auth.js';
import { registrarManejadorSesionInvalida } from '../api/cliente.js';
import { SesionContexto } from './sesion.js';

// Guarda el usuario actual. Al cargar la app llama a GET /api/auth/sesion.
export function SesionProveedor({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    // Si cualquier petición responde 401, se limpia el usuario y
    // RutaProtegida redirige a /auth.
    registrarManejadorSesionInvalida(() => setUsuario(null));

    obtenerSesion()
      .then((u) => {
        if (activo) setUsuario(u);
      })
      .catch(() => {
        if (activo) setUsuario(null);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
      registrarManejadorSesionInvalida(null);
    };
  }, []);

  const iniciarSesion = useCallback(async (credenciales) => {
    const u = await apiIniciarSesion(credenciales);
    setUsuario(u);
    return u;
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await apiCerrarSesion();
    } finally {
      setUsuario(null);
    }
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, cerrarSesion }),
    [usuario, cargando, iniciarSesion, cerrarSesion],
  );

  return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>;
}
