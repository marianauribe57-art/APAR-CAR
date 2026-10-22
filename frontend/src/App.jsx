import { Navigate, Route, Routes } from 'react-router';
import InicioSesion from './pages/InicioSesion';
import Panel from './pages/Panel';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/panel" replace />} />
      <Route path="/auth" element={<InicioSesion />} />
      <Route path="/panel" element={<Panel />} />
    </Routes>
  );
}

export default App;