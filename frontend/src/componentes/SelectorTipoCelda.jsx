// Lista desplegable del tipo de vehículo que acepta una celda
export default function SelectorTipoCelda({ id, valor, onChange, error }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        Tipo de vehículo
      </label>
      <select
        id={id}
        className={`form-select${error ? ' is-invalid' : ''}`}
        value={valor}
        onChange={onChange}
      >
        <option value="CARRO">Carro</option>
        <option value="MOTO">Moto</option>
        <option value="MIXTA">Mixta (carro o moto)</option>
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}