import { NavLink, Outlet } from "react-router";

function LayoutPrincipal() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="bg-dark text-white px-3 py-2">
        <span className="fs-4 fw-bold">APAR-CAR</span>
      </header>

      <div className="d-flex flex-grow-1">
        <nav className="bg-light border-end p-3" style={{ width: "220px" }}>
          <ul className="nav nav-pills flex-column gap-1">
            <li className="nav-item">
              <NavLink to="/panel" className="nav-link">
                Panel de control
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/estacionamientos" className="nav-link">
                Estacionamientos
              </NavLink>
            </li>
          </ul>
        </nav>

        <main className="flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LayoutPrincipal;
