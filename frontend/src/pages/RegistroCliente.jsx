import { registrarCliente } from '../api/auth.js';
import FormularioRegistro from '../componentes/FormularioRegistro.jsx';
import TarjetaAcceso from '../componentes/TarjetaAcceso.jsx';

function RegistroCliente() {
  return (
    <TarjetaAcceso titulo="Crea tu cuenta" subtitulo="Regístrate como cliente.">
      <FormularioRegistro esAdministrador={false} registrar={registrarCliente} />
    </TarjetaAcceso>
  );
}

export default RegistroCliente;
