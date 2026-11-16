import { NavLink, Outlet, useNavigate } from 'react-router';
import { useSesion } from '../contexto/sesion.js';

const enlaces = [
  { ruta: '/panel', texto: 'Panel de control' },
  { ruta: '/estacionamientos', texto: 'Estacionamientos' },
  { ruta: '/celdas', texto: 'Celdas' },
];

function LayoutPrincipal() {
  const { cerrarSesion } = useSesion();
  const navegar = useNavigate();

  async function manejarCerrarSesion() {
    try {
      await cerrarSesion();
    } finally {
      navegar('/auth', { replace: true });
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="bg-dark text-white px-3 py-2">
        <span className="fs-4 fw-bold">APAR-CAR</span>
      </header>

      <div className="d-flex flex-grow-1">
        <nav
          className="d-none d-md-flex flex-column bg-light border-end p-3"
          style={{ width: '220px' }}
          aria-label="Menú principal"
        >
          <ul className="nav nav-pills flex-column gap-1">
            {enlaces.map((enlace) => (
              <li className="nav-item" key={enlace.ruta}>
                <NavLink to={enlace.ruta} className="nav-link">
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="btn btn-outline-danger mt-auto"
            onClick={manejarCerrarSesion}
          >
            Cerrar sesión
          </button>
        </nav>

        <main className="flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>

      <nav
        className="d-md-none sticky-bottom bg-light border-top"
        aria-label="Menú principal"
      >
        <ul className="nav nav-pills flex-nowrap overflow-auto gap-1 p-2">
          {enlaces.map((enlace) => (
            <li className="nav-item" key={enlace.ruta}>
              <NavLink to={enlace.ruta} className="nav-link text-nowrap">
                {enlace.texto}
              </NavLink>
            </li>
          ))}
          <li className="nav-item ms-auto">
            <button
              type="button"
              className="btn btn-outline-danger text-nowrap"
              onClick={manejarCerrarSesion}
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default LayoutPrincipal;