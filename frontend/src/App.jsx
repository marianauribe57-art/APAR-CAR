import { Route, Routes } from "react-router";
import { SesionProveedor } from "./contexto/SesionContexto";
import LayoutPrincipal from "./layouts/LayoutPrincipal";
import Estacionamientos from "./pages/Estacionamientos";
import InicioSesion from "./pages/InicioSesion";
import MiCuenta from "./pages/MiCuenta";
import NoEncontrada from "./pages/NoEncontrada";
import Operacion from "./pages/Operacion";
import Panel from "./pages/Panel";
import RegistroAdministrador from "./pages/RegistroAdministrador";
import RegistroCliente from "./pages/RegistroCliente";
import RedireccionInicio from "./rutas/RedireccionInicio";
import RutaProtegida from "./rutas/RutaProtegida";
import Celdas from "./pages/Celdas";

function App() {
  return (
    <SesionProveedor>
      <Routes>
        <Route path="/" element={<RedireccionInicio />} />
        <Route path="/auth" element={<InicioSesion />} />
        <Route
          path="/auth/registro-administrador"
          element={<RegistroAdministrador />}
        />
        <Route path="/auth/registro-cliente" element={<RegistroCliente />} />

        <Route element={<RutaProtegida roles={["ADMINISTRADOR"]} />}>
          <Route element={<LayoutPrincipal />}>
            <Route path="/panel" element={<Panel />} />
            <Route path="/estacionamientos" element={<Estacionamientos />} />
            <Route path="/celdas" element={<Celdas />} />
          </Route>
        </Route>

        <Route element={<RutaProtegida roles={["OPERARIO"]} />}>
          <Route path="/operacion" element={<Operacion />} />
        </Route>

        <Route element={<RutaProtegida roles={["CLIENTE"]} />}>
          <Route path="/mi-cuenta" element={<MiCuenta />} />
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </SesionProveedor>
  );
}

export default App;
