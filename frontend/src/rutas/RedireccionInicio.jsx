import { Navigate } from 'react-router';
import { useSesion } from '../contexto/sesion.js';
import Cargando from './Cargando.jsx';
import { rutaInicioPorRol } from './rutaPorRol.js';

// Ruta "/": manda a cada rol a su pantalla, o a /auth si no hay sesión
export default function RedireccionInicio() {
  const { usuario, cargando } = useSesion();
  if (cargando) return <Cargando />;
  return <Navigate to={usuario ? rutaInicioPorRol(usuario.rol) : '/auth'} replace />;
}
