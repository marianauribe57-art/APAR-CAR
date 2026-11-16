import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import TarjetaAcceso from '../componentes/TarjetaAcceso.jsx';
import Campo from '../componentes/Campo.jsx';
import { mensajeErrorGeneral } from '../componentes/validacion.js';
import { useSesion } from '../contexto/sesion.js';
import Cargando from '../rutas/Cargando.jsx';
import { rutaInicioPorRol } from '../rutas/rutaPorRol.js';

// Mensaje genérico: no revela si falló el correo o la contraseña
const MENSAJE_CREDENCIALES = 'Correo o contraseña incorrectos.';

function mensajeBloqueo(minutos) {
  if (!minutos) return 'Tu cuenta está bloqueada temporalmente. Intenta más tarde.';
  const unidad = minutos === 1 ? 'minuto' : 'minutos';
  return `Tu cuenta está bloqueada por varios intentos fallidos. Intenta de nuevo en ${minutos} ${unidad}.`;
}

function InicioSesion() {
  const { usuario, cargando, iniciarSesion } = useSesion();
  const navegar = useNavigate();
  const { state } = useLocation();

  const [correo, setCorreo] = useState(state?.correo ?? '');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null); // { tipo: 'danger' | 'warning', texto }
  const [enviando, setEnviando] = useState(false);

  if (cargando) return <Cargando />;
  // Si ya hay sesión, no tiene sentido mostrar el login
  if (usuario && !enviando) return <Navigate to={rutaInicioPorRol(usuario.rol)} replace />;

  const enviar = async (evento) => {
    evento.preventDefault();
    setError(null);
    if (!correo.trim() || !contrasena) {
      setError({ tipo: 'danger', texto: 'Escribe tu correo y tu contraseña.' });
      return;
    }

    setEnviando(true);
    try {
      const u = await iniciarSesion({ correo: correo.trim().toLowerCase(), contrasena });
      navegar(rutaInicioPorRol(u.rol), { replace: true });
    } catch (e) {
      setContrasena('');
      if (e?.estado === 401) setError({ tipo: 'danger', texto: MENSAJE_CREDENCIALES });
      else if (e?.estado === 423) setError({ tipo: 'warning', texto: mensajeBloqueo(e.minutosRestantes) });
      else setError({ tipo: 'danger', texto: mensajeErrorGeneral(e) });
      setEnviando(false);
    }
  };

  return (
    <TarjetaAcceso titulo="Iniciar sesión" subtitulo="Ingresa con tu correo y contraseña.">
      {state?.aviso && !error && (
        <div className="alert alert-success" role="status">
          {state.aviso}
        </div>
      )}
      {error && (
        <div className={`alert alert-${error.tipo}`} role="alert">
          {error.texto}
        </div>
      )}

      <form onSubmit={enviar} noValidate>
        <Campo
          id="correo"
          etiqueta="Correo"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <Campo
          id="contrasena"
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />
        <button type="submit" className="btn btn-primary w-100 py-2" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <hr className="my-4" />
      <p className="text-center mb-2">¿No tienes cuenta?</p>
      <div className="d-grid gap-2">
        <Link to="/auth/registro-cliente" className="btn btn-outline-primary">
          Crear cuenta de cliente
        </Link>
        <Link to="/auth/registro-administrador" className="btn btn-outline-secondary">
          Registrar mi parqueadero
        </Link>
      </div>
    </TarjetaAcceso>
  );
}

export default InicioSesion;
