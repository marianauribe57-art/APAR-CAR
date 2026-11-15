import { Route, Routes } from 'react-router';
import { SesionProveedor } from './contexto/SesionContexto';
import LayoutPrincipal from './layouts/LayoutPrincipal';
import Estacionamientos from './pages/Estacionamientos';
import InicioSesion from './pages/InicioSesion';
import MiCuenta from './pages/MiCuenta';
import NoEncontrada from './pages/NoEncontrada';
import Operacion from './pages/Operacion';
import Panel from './pages/Panel';
import RedireccionInicio from './rutas/RedireccionInicio';
import RutaProtegida from './rutas/RutaProtegida';

function App() {
  return (
    <SesionProveedor>
      <Routes>
        <Route path="/" element={<RedireccionInicio />} />
        <Route path="/auth" element={<InicioSesion />} />

        <Route element={<RutaProtegida roles={['ADMINISTRADOR']} />}>
          <Route element={<LayoutPrincipal />}>
            <Route path="/panel" element={<Panel />} />
            <Route path="/estacionamientos" element={<Estacionamientos />} />
          </Route>
        </Route>

        <Route element={<RutaProtegida roles={['OPERARIO']} />}>
          <Route path="/operacion" element={<Operacion />} />
        </Route>

        <Route element={<RutaProtegida roles={['CLIENTE']} />}>
          <Route path="/mi-cuenta" element={<MiCuenta />} />
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </SesionProveedor>
  );
}

export default App;
