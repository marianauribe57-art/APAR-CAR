// Casilla de la política de tratamiento de datos (HU-35). Nunca viene marcada.
export default function CasillaPolitica({ marcada, onChange, error }) {
  return (
    <div className="form-check mb-4">
      <input
        id="aceptaPolitica"
        name="aceptaPolitica"
        type="checkbox"
        className={`form-check-input${error ? ' is-invalid' : ''}`}
        checked={marcada}
        onChange={onChange}
        aria-describedby={error ? 'aceptaPolitica-error' : undefined}
      />
      <label htmlFor="aceptaPolitica" className="form-check-label">
        Acepto la política de tratamiento de datos personales
      </label>
      {error && (
        <div id="aceptaPolitica-error" className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
}
