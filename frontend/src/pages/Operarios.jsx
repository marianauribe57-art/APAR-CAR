import { useEffect, useState } from 'react';
import { crearOperario, desactivarOperario, listarOperarios } from '../api/operarios.js';
import Campo from '../componentes/Campo.jsx';
import { LARGO_MINIMO_CONTRASENA, mensajeErrorGeneral } from '../componentes/validacion.js';

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DATOS_INICIALES = {
  nombre: '',
  correo: '',
  telefono: '',
  contrasenaInicial: '',
  declaraAutorizacion: false, // RN-08: nunca viene marcada
};

// Validación del lado del cliente. El backend vuelve a validar todo.
function validarOperario(datos) {
  const errores = {};
  if (!datos.nombre.trim()) errores.nombre = 'Escribe el nombre del operario.';
  if (!CORREO.test(datos.correo.trim())) errores.correo = 'Escribe un correo válido.';
  if (!datos.telefono.trim()) errores.telefono = 'Escribe el teléfono del operario.';
  if (datos.contrasenaInicial.length < LARGO_MINIMO_CONTRASENA) {
    errores.contrasenaInicial = `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  }
  if (!datos.declaraAutorizacion) {
    errores.declaraAutorizacion = 'Debes declarar que tienes la autorización del operario.';
  }
  return errores;
}

function EstadoOperario({ operario }) {
  if (!operario.activo) return <span className="badge text-bg-secondary">Inactivo</span>;
  if (operario.debeCambiarContrasena) {
    return <span className="badge text-bg-warning">Pendiente de primer ingreso</span>;
  }
  return <span className="badge text-bg-success">Activo</span>;
}

// HU-38: el administrador registra y desactiva a sus operarios
export default function Operarios() {
  const [operarios, setOperarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState('');

  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [porDesactivar, setPorDesactivar] = useState(null); // id del operario a confirmar

  // Para volver a pedir la lista después de crear o desactivar
  async function cargarOperarios() {
    setErrorLista('');
    try {
      setOperarios(await listarOperarios());
    } catch (error) {
      setErrorLista(mensajeErrorGeneral(error));
    }
  }

  // Primera carga, con el mismo patrón de SesionContexto
  useEffect(() => {
    let activo = true;
    listarOperarios()
      .then((lista) => {
        if (activo) setOperarios(lista);
      })
      .catch((error) => {
        if (activo) setErrorLista(mensajeErrorGeneral(error));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const cambiar = (evento) => {
    const { name, type, value, checked } = evento.target;
    setDatos((anterior) => ({ ...anterior, [name]: type === 'checkbox' ? checked : value }));
    setErrores((anterior) => ({ ...anterior, [name]: undefined }));
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setErrorApi('');
    setAviso('');
    const nuevosErrores = validarOperario(datos);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    try {
      const operario = await crearOperario({
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim().toLowerCase(),
        telefono: datos.telefono.trim(),
        contrasenaInicial: datos.contrasenaInicial,
        declaraAutorizacion: datos.declaraAutorizacion,
      });
      setDatos(DATOS_INICIALES);
      setAviso(`Operario ${operario?.nombre ?? ''} creado. Entrégale su contraseña inicial: el sistema le pedirá cambiarla.`);
      await cargarOperarios();
    } catch (error) {
      if (error?.estado === 400 && error.datos?.campos) {
        setErrores(error.datos.campos);
      } else if (error?.estado === 409) {
        // Escenario de error de HU-38: el mensaje queda junto al correo
        setErrores({ correo: error.datos?.mensaje ?? 'Ese correo no se puede usar. Prueba con otro.' });
      } else {
        setErrorApi(mensajeErrorGeneral(error));
      }
    } finally {
      setEnviando(false);
    }
  };

  const confirmarDesactivar = async (id) => {
    setErrorLista('');
    try {
      await desactivarOperario(id);
      setPorDesactivar(null);
      await cargarOperarios();
    } catch (error) {
      setErrorLista(mensajeErrorGeneral(error));
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Operarios</h1>

      <div className="row g-4">
        <section className="col-12 col-xl-7" aria-labelledby="titulo-lista">
          <h2 id="titulo-lista" className="h5">Operarios de tu parqueadero</h2>

          {errorLista && <div className="alert alert-danger" role="alert">{errorLista}</div>}

          {cargando ? (
            <p className="text-muted">Cargando operarios…</p>
          ) : operarios.length === 0 ? (
            <p className="text-muted">Aún no tienes operarios. Registra el primero con el formulario.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Correo</th>
                    <th scope="col">Teléfono</th>
                    <th scope="col">Estado</th>
                    <th scope="col"><span className="visually-hidden">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {operarios.map((operario) => (
                    <tr key={operario.id}>
                      <td>{operario.nombre}</td>
                      <td>{operario.correo}</td>
                      <td>{operario.telefono}</td>
                      <td><EstadoOperario operario={operario} /></td>
                      <td className="text-end">
                        {operario.activo && porDesactivar !== operario.id && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setPorDesactivar(operario.id)}
                          >
                            Desactivar
                          </button>
                        )}
                        {porDesactivar === operario.id && (
                          <span className="d-inline-flex flex-wrap justify-content-end align-items-center gap-2">
                            <span className="small">¿Seguro?</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              aria-label={`Sí, desactivar a ${operario.nombre}`}
                              onClick={() => confirmarDesactivar(operario.id)}
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setPorDesactivar(null)}
                            >
                              Cancelar
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="col-12 col-xl-5" aria-labelledby="titulo-nuevo">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h2 id="titulo-nuevo" className="h5 mb-3">Nuevo operario</h2>

              {aviso && <div className="alert alert-success" role="status">{aviso}</div>}
              {errorApi && <div className="alert alert-danger" role="alert">{errorApi}</div>}

              <form onSubmit={enviar} noValidate>
                <Campo id="nombre" etiqueta="Nombre completo" autoComplete="off"
                  value={datos.nombre} onChange={cambiar} error={errores.nombre} />
                <Campo id="correo" etiqueta="Correo" type="email" inputMode="email" autoComplete="off"
                  value={datos.correo} onChange={cambiar} error={errores.correo} />
                <Campo id="telefono" etiqueta="Teléfono" type="tel" inputMode="tel" autoComplete="off"
                  value={datos.telefono} onChange={cambiar} error={errores.telefono} />
                <Campo id="contrasenaInicial" etiqueta="Contraseña inicial" type="password" autoComplete="new-password"
                  value={datos.contrasenaInicial} onChange={cambiar} error={errores.contrasenaInicial}
                  ayuda={`Mínimo ${LARGO_MINIMO_CONTRASENA} caracteres. El operario la cambiará en su primer ingreso.`} />

                <div className="form-check mb-4">
                  <input
                    id="declaraAutorizacion"
                    name="declaraAutorizacion"
                    type="checkbox"
                    className={`form-check-input${errores.declaraAutorizacion ? ' is-invalid' : ''}`}
                    checked={datos.declaraAutorizacion}
                    onChange={cambiar}
                    aria-describedby={errores.declaraAutorizacion ? 'declaraAutorizacion-error' : undefined}
                  />
                  <label htmlFor="declaraAutorizacion" className="form-check-label">
                    Declaro que el operario me autorizó a registrar sus datos personales
                  </label>
                  {errores.declaraAutorizacion && (
                    <div id="declaraAutorizacion-error" className="invalid-feedback">
                      {errores.declaraAutorizacion}
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
                  {enviando ? 'Creando operario…' : 'Crear operario'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
