import { useState } from 'react';
import { crearCeldasEnLote } from '../api/celdas.js';
import Campo from './Campo.jsx';
import SelectorTipoCelda from './SelectorTipoCelda.jsx';

const MAXIMO_POR_LOTE = 200;

// Registra varias celdas de una vez: prefijo A + cantidad 3 = A-01, A-02, A-03
export default function FormularioLoteCeldas({ onCreadas }) {
  const [prefijo, setPrefijo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [tipoPermitido, setTipoPermitido] = useState('CARRO');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    setErrorGeneral('');
    setExito('');

    const prefijoLimpio = prefijo.trim().toUpperCase();
    const numero = Number(cantidad);
    const nuevosErrores = {};
    if (!prefijoLimpio) nuevosErrores.prefijo = 'Escribe el prefijo.';
    if (!Number.isInteger(numero) || numero < 1 || numero > MAXIMO_POR_LOTE) {
      nuevosErrores.cantidad = `Escribe un número entre 1 y ${MAXIMO_POR_LOTE}.`;
    }
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    try {
      await crearCeldasEnLote({ prefijo: prefijoLimpio, cantidad: numero, tipoPermitido });
      setExito(`Se crearon ${numero} celdas con el prefijo ${prefijoLimpio}.`);
      setPrefijo('');
      setCantidad('');
      onCreadas();
    } catch (error) {
      if (error?.estado === 409) {
        // El lote es todo o nada: si una ya existe, no se crea ninguna
        setErrores({
          prefijo: 'Alguna de esas celdas ya existe. No se creó ninguna; cambia el prefijo.',
        });
      } else if (error?.estado === 400 && error.datos?.campos) {
        setErrores(error.datos.campos);
      } else {
        setErrorGeneral(error?.datos?.mensaje ?? 'No se pudieron crear las celdas.');
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
        id="prefijo"
        etiqueta="Prefijo"
        placeholder="Ej: A"
        value={prefijo}
        onChange={(e) => setPrefijo(e.target.value)}
        error={errores.prefijo}
      />
      <Campo
        id="cantidad"
        etiqueta="Cantidad"
        type="number"
        inputMode="numeric"
        min="1"
        max={MAXIMO_POR_LOTE}
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        error={errores.cantidad}
      />
      <SelectorTipoCelda
        id="tipoLote"
        valor={tipoPermitido}
        onChange={(e) => setTipoPermitido(e.target.value)}
        error={errores.tipoPermitido}
      />
      <button type="submit" className="btn btn-outline-primary w-100" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Crear celdas'}
      </button>
    </form>
  );
}