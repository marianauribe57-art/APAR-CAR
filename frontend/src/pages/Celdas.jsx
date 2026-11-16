import { useCallback, useEffect, useState } from "react";
import { listarCeldas } from "../api/celdas.js";
import Cargando from "../rutas/Cargando.jsx";
import FormularioCelda from "../componentes/FormularioCelda.jsx";
import FormularioLoteCeldas from "../componentes/FormularioLoteCeldas.jsx";

const NOMBRE_TIPO = { CARRO: "Carro", MOTO: "Moto", MIXTA: "Mixta" };

function Celdas() {
  const [celdas, setCeldas] = useState([]);
  const [totales, setTotales] = useState({ libres: 0, ocupadas: 0 });
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  // Pide las celdas al backend. Se usa al abrir la pantalla y después de crear
  const cargar = useCallback(
    () =>
      listarCeldas()
        .then((datos) => {
          setCeldas(datos.celdas ?? []);
          setTotales(datos.totales ?? { libres: 0, ocupadas: 0 });
          setErrorCarga("");
        })
        .catch(() =>
          setErrorCarga("No se pudieron cargar las celdas. Intenta de nuevo."),
        )
        .finally(() => setCargando(false)),
    [],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando) return <Cargando />;

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Celdas</h1>

      {errorCarga && (
        <div className="alert alert-danger" role="alert">
          {errorCarga}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6">
          <div className="card text-center border-success">
            <div className="card-body">
              <p className="display-6 mb-0 text-success">{totales.libres}</p>
              <p className="mb-0">Libres</p>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="card text-center border-danger">
            <div className="card-body">
              <p className="display-6 mb-0 text-danger">{totales.ocupadas}</p>
              <p className="mb-0">Ocupadas</p>
            </div>
          </div>
        </div>
      </div>

      {celdas.length === 0 ? (
        <p className="text-muted">
          Todavía no hay celdas. Registra la primera abajo.
        </p>
      ) : (
        <ul className="list-group mb-4">
          {celdas.map((celda) => (
            <li
              key={celda.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>
                <strong>{celda.codigo}</strong>{" "}
                <span className="text-muted">
                  · {NOMBRE_TIPO[celda.tipoPermitido]}
                </span>
              </span>
              <span
                className={`badge ${celda.estado === "LIBRE" ? "text-bg-success" : "text-bg-danger"}`}
              >
                {celda.estado === "LIBRE" ? "Libre" : "Ocupada"}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Una celda</h2>
              <FormularioCelda onCreada={cargar} />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Varias celdas (lote)</h2>
              <FormularioLoteCeldas onCreadas={cargar} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Celdas;
