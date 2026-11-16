// Marco común de las pantallas de acceso: centrado y a todo el ancho en celular
export default function TarjetaAcceso({ titulo, subtitulo, children }) {
  return (
    <main className="min-vh-100 d-flex align-items-center bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            <p className="text-center fs-3 fw-bold mb-3">APAR-CAR</p>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h1 className="h4 mb-1">{titulo}</h1>
                {subtitulo && <p className="text-muted mb-4">{subtitulo}</p>}
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
