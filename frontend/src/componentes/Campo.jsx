// Campo de formulario Bootstrap con su etiqueta y mensaje de error
export default function Campo({ id, etiqueta, error, ayuda, ...props }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {etiqueta}
      </label>
      <input
        id={id}
        name={id}
        className={`form-control${error ? ' is-invalid' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error ? (
        <div id={`${id}-error`} className="invalid-feedback">
          {error}
        </div>
      ) : (
        ayuda && <div className="form-text">{ayuda}</div>
      )}
    </div>
  );
}
