import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Campo from './Campo.jsx';
import CasillaPolitica from './CasillaPolitica.jsx';
import { LARGO_MINIMO_CONTRASENA, mensajeErrorGeneral, validarRegistro } from './validacion.js';

const DATOS_INICIALES = {
  nombre: '',
  apellido: '',
  correo: '',
  contrasena: '',
  telefono: '',
  nombreParqueadero: '',
  direccionParqueadero: '',
  aceptaPolitica: false, // HU-35: sin marcar por defecto
};

// Formulario compartido por el registro de administrador y el de cliente
export default function FormularioRegistro({ esAdministrador, registrar }) {
  const navegar = useNavigate();
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState('');
  const [correoRepetido, setCorreoRepetido] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (evento) => {
    const { name, type, value, checked } = evento.target;
    setDatos((anterior) => ({
      ...anterior,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrores((anterior) => ({ ...anterior, [name]: undefined }));
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setErrorApi('');
    setCorreoRepetido(false);
    const nuevosErrores = validarRegistro(datos, { esAdministrador });
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const cuerpo = {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      correo: datos.correo.trim().toLowerCase(),
      contrasena: datos.contrasena,
      telefono: datos.telefono.trim(),
      aceptaPolitica: datos.aceptaPolitica,
    };
    if (esAdministrador) {
      cuerpo.nombreParqueadero = datos.nombreParqueadero.trim();
      cuerpo.direccionParqueadero = datos.direccionParqueadero.trim();
    }

    setEnviando(true);
    try {
      await registrar(cuerpo);
      navegar('/auth', {
        replace: true,
        state: {
          aviso: 'Cuenta creada. Ya puedes iniciar sesión.',
          correo: cuerpo.correo,
        },
      });
    } catch (error) {
      // 400: el backend dice qué campo falló → se muestra debajo de cada uno
      if (error?.estado === 400 && error.datos?.campos) {
        setErrores(error.datos.campos);
      }
      setErrorApi(mensajeErrorGeneral(error));
      setCorreoRepetido(error?.estado === 409);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate>
      {errorApi && (
        <div className="alert alert-danger" role="alert">
          {errorApi}
          {correoRepetido && (
            <div className="mt-2">
              <Link to="/auth">Inicia sesión</Link> o{' '}
              <button type="button" className="btn btn-link p-0 align-baseline" disabled>
                recupera tu contraseña (próximamente)
              </button>
            </div>
          )}
        </div>
      )}

      <Campo
        id="nombre"
        etiqueta="Nombre"
        autoComplete="given-name"
        value={datos.nombre}
        onChange={cambiar}
        error={errores.nombre}
      />
      <Campo
        id="apellido"
        etiqueta="Apellido"
        autoComplete="family-name"
        value={datos.apellido}
        onChange={cambiar}
        error={errores.apellido}
      />
      <Campo
        id="correo"
        etiqueta="Correo"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={datos.correo}
        onChange={cambiar}
        error={errores.correo}
      />
      <Campo
        id="telefono"
        etiqueta="Teléfono"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        value={datos.telefono}
        onChange={cambiar}
        error={errores.telefono}
      />
      <Campo
        id="contrasena"
        etiqueta="Contraseña"
        type="password"
        autoComplete="new-password"
        value={datos.contrasena}
        onChange={cambiar}
        error={errores.contrasena}
        ayuda={`Mínimo ${LARGO_MINIMO_CONTRASENA} caracteres.`}
      />

      {esAdministrador && (
        <>
          <hr className="my-4" />
          <p className="fw-semibold mb-3">Datos del parqueadero</p>
          <Campo
            id="nombreParqueadero"
            etiqueta="Nombre del parqueadero"
            autoComplete="organization"
            value={datos.nombreParqueadero}
            onChange={cambiar}
            error={errores.nombreParqueadero}
          />
          <Campo
            id="direccionParqueadero"
            etiqueta="Dirección del parqueadero"
            autoComplete="street-address"
            value={datos.direccionParqueadero}
            onChange={cambiar}
            error={errores.direccionParqueadero}
          />
        </>
      )}

      <CasillaPolitica
        marcada={datos.aceptaPolitica}
        onChange={cambiar}
        error={errores.aceptaPolitica}
      />

      <button type="submit" className="btn btn-primary w-100 py-2" disabled={enviando}>
        {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>

      <p className="text-center mt-4 mb-0">
        ¿Ya tienes cuenta? <Link to="/auth">Inicia sesión</Link>
      </p>
    </form>
  );
}
