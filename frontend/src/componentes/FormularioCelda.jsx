import { useState } from 'react';
import { crearCelda } from '../api/celdas.js';
import Campo from './Campo.jsx';
import SelectorTipoCelda from './SelectorTipoCelda.jsx';

// Registra una sola celda. Al crearla, avisa a la pantalla con onCreada()
export default function FormularioCelda({ onCreada }) {
  const [codigo, setCodigo] = useState('');
  const [tipoPermitido, setTipoPermitido] = useState('CARRO');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    setErrorGeneral('');
    setExito('');

    const codigoLimpio = codigo.trim().toUpperCase();
    if (!codigoLimpio) {
      setErrores({ codigo: 'Escribe el código de la celda.' });
      return;
    }
    setErrores({});

    setEnviando(true);
    try {
      await crearCelda({ codigo: codigoLimpio, tipoPermitido });
      setExito(`Celda ${codigoLimpio} creada.`);
      setCodigo('');
      onCreada();
    } catch (error) {
      if (error?.estado === 409) {
        // HU-07: el mensaje va junto al campo del código
        setErrores({ codigo: `Ya existe una celda con el código ${codigoLimpio}.` });
      } else if (error?.estado === 400 && error.datos?.campos) {
        setErrores(error.datos.campos);
      } else {
        setErrorGeneral(error?.datos?.mensaje ?? 'No se pudo crear la celda. Intenta de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate>
      {exito && <div className="alert alert-success">{exito}</div>}
      {errorGeneral && <div className="alert alert-danger">{errorGeneral}</div>}

      <Campo
        id="codigo"
        etiqueta="Código"
        placeholder="Ej: A-01"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        error={errores.codigo}
      />
      <SelectorTipoCelda
        id="tipoCelda"
        valor={tipoPermitido}
        onChange={(e) => setTipoPermitido(e.target.value)}
        error={errores.tipoPermitido}
      />
      <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Crear celda'}
      </button>
    </form>
  );
}