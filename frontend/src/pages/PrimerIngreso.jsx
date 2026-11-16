import { useState } from 'react';
import { useNavigate } from 'react-router';
import { completarPrimerIngreso } from '../api/operarios.js';
import Campo from '../componentes/Campo.jsx';
import CasillaPolitica from '../componentes/CasillaPolitica.jsx';
import TarjetaAcceso from '../componentes/TarjetaAcceso.jsx';
import { LARGO_MINIMO_CONTRASENA, mensajeErrorGeneral } from '../componentes/validacion.js';
import { useSesion } from '../contexto/sesion.js';
import { rutaInicioPorRol } from '../rutas/rutaPorRol.js';

const DATOS_INICIALES = {
  aceptaPolitica: false, // HU-35: nunca viene marcada
  contrasenaNueva: '',
  confirmacion: '',
};

function validar(datos) {
  const errores = {};
  if (!datos.aceptaPolitica) errores.aceptaPolitica = 'Debes aceptar la política de tratamiento de datos.';
  if (datos.contrasenaNueva.length < LARGO_MINIMO_CONTRASENA) {
    errores.contrasenaNueva = `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  }
  if (datos.confirmacion !== datos.contrasenaNueva) errores.confirmacion = 'Las contraseñas no coinciden.';
  return errores;
}

// HU-38: el operario acepta la política y cambia la contraseña que le dio el administrador
export default function PrimerIngreso() {
  const navegar = useNavigate();
  const { usuario, cerrarSesion } = useSesion();
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState('');
  const [enviando, setEnviando] = useState(false);

  const irAlInicio = () => navegar(rutaInicioPorRol(usuario?.rol), { replace: true });

  const cambiar = (evento) => {
    const { name, type, value, checked } = evento.target;
    setDatos((anterior) => ({ ...anterior, [name]: type === 'checkbox' ? checked : value }));
    setErrores((anterior) => ({ ...anterior, [name]: undefined }));
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setErrorApi('');
    const nuevosErrores = validar(datos);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    try {
      await completarPrimerIngreso({
        aceptaPolitica: datos.aceptaPolitica,
        contrasenaNueva: datos.contrasenaNueva,
      });
      irAlInicio();
    } catch (error) {
      if (error?.datos?.error === 'PRIMER_INGRESO_NO_REQUERIDO') return irAlInicio();
      if (error?.estado === 400 && error.datos?.campos) setErrores(error.datos.campos);
      setErrorApi(mensajeErrorGeneral(error));
    } finally {
      setEnviando(false);
    }
  };

  const salir = async () => {
    await cerrarSesion();
    navegar('/auth', { replace: true });
  };

  return (
    <TarjetaAcceso
      titulo={`Bienvenido${usuario?.nombre ? `, ${usuario.nombre}` : ''}`}
      subtitulo="Antes de empezar, acepta la política de datos y cambia la contraseña que te dio el administrador."
    >
      {errorApi && <div className="alert alert-danger" role="alert">{errorApi}</div>}

      <form onSubmit={enviar} noValidate>
        <CasillaPolitica marcada={datos.aceptaPolitica} onChange={cambiar} error={errores.aceptaPolitica} />

        <Campo id="contrasenaNueva" etiqueta="Contraseña nueva" type="password" autoComplete="new-password"
          value={datos.contrasenaNueva} onChange={cambiar} error={errores.contrasenaNueva}
          ayuda={`Mínimo ${LARGO_MINIMO_CONTRASENA} caracteres y distinta a la inicial.`} />
        <Campo id="confirmacion" etiqueta="Repite la contraseña nueva" type="password" autoComplete="new-password"
          value={datos.confirmacion} onChange={cambiar} error={errores.confirmacion} />

        <button type="submit" className="btn btn-primary w-100 py-2" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar y continuar'}
        </button>
      </form>

      <p className="text-center mt-4 mb-0">
        <button type="button" className="btn btn-link p-0" onClick={salir}>Cerrar sesión</button>
      </p>
    </TarjetaAcceso>
  );
}
