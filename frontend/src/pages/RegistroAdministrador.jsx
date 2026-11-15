import { registrarAdministrador } from '../api/auth.js';
import FormularioRegistro from '../componentes/FormularioRegistro.jsx';
import TarjetaAcceso from '../componentes/TarjetaAcceso.jsx';

function RegistroAdministrador() {
  return (
    <TarjetaAcceso
      titulo="Registra tu parqueadero"
      subtitulo="Crea la cuenta de administrador de tu parqueadero."
    >
      <FormularioRegistro esAdministrador registrar={registrarAdministrador} />
    </TarjetaAcceso>
  );
}

export default RegistroAdministrador;
