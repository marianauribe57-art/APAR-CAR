import { Link, Navigate, Outlet, useLocation } from 'react-router';
import { useSesion } from '../contexto/sesion.js';
import Cargando from './Cargando.jsx';
import { rutaInicioPorRol } from './rutaPorRol.js';

// Uso: <Route element={<RutaProtegida roles={['ADMINISTRADOR']} />}> ...rutas hijas... </Route>
export default function RutaProtegida({ roles }) {
  const { usuario, cargando } = useSesion();
  const ubicacion = useLocation();

  if (cargando) return <Cargando />;

  // Sin sesión (401): a /auth, recordando a dónde quería ir
  if (!usuario) {
    return <Navigate to="/auth" replace state={{ desde: ubicacion.pathname }} />;
  }

  // Rol no permitido (403)
  if (roles && !roles.includes(usuario.rol)) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          No tienes permiso para ver esta pantalla.
        </div>
        <Link to={rutaInicioPorRol(usuario.rol)} className="btn btn-primary">
          Ir a mi inicio
        </Link>
      </div>
    );
  }

  return <Outlet />;
}
