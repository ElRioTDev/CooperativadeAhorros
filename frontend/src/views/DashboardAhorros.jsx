import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function DashboardAhorros() {
  const [ahorro, setAhorro] = useState({ saldo_disponible: 0, meta_ahorro: 0, saldo_ahorrado: 0 });
  const [transacciones, setTransacciones] = useState([]);
  const [formTx, setFormTx] = useState({ tipo: 'ingreso', monto: '', descripcion: '' });
  const [error, setError] = useState('');

  // Inicializamos el hook de navegación
  const navigate = useNavigate();

  // Recuperamos el usuario de forma global en el componente para usar su rol
  const usuarioLogueado = JSON.parse(localStorage.getItem('user')) || {};

  // Condición de seguridad frontend
  const esPersonalAutorizado = usuarioLogueado.role === 'admin' || usuarioLogueado.role === 'socio';

  const cargarDatos = async () => {
    if (!usuarioLogueado.id) return;

    try {
      const response = await fetch(`http://localhost:5000/ahorros/${usuarioLogueado.id}`);
      const data = await response.json();
      if (data.success) {
        setAhorro(data.ahorro);
        setTransacciones(data.transacciones);
      }
    } catch (error) {
      console.error("Error cargando ahorros:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleTransaccion = async (e) => {
    e.preventDefault();
    setError('');
    const usuarioLogueado = JSON.parse(localStorage.getItem('user'));

    try {
      const response = await fetch('http://localhost:5000/ahorros/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formTx, id_usuario: usuarioLogueado.id })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setFormTx({ tipo: 'ingreso', monto: '', descripcion: '' });
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // 3. Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('user'); // Borramos los datos del usuario
    navigate('/'); // Redirigimos al Login (ajusta la ruta '/' si tu login está en otra, ej: '/login')
  };

  return (
    <>
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { background-color: white; color: black; }
            .card { border: none !important; box-shadow: none !important; }
          }
        `}
      </style>

      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>Mi Estado de Cuenta</h2>
            {/* Indicador visual de rol */}
            <span className="badge bg-dark">Rol: {usuarioLogueado.role?.toUpperCase()}</span>
          </div>

          {/* 4. Agrupamos los botones en un div para que queden juntos a la derecha */}
          <div className="d-flex gap-2 no-print">
            <button className="btn btn-secondary" onClick={handlePrintPDF}>
              Imprimir Reporte (PDF)
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Cajas de Estados de Cuenta */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary mb-3 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Saldo Disponible</h5>
                <h3>${Number(ahorro.saldo_disponible).toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success mb-3 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Ahorrado</h5>
                <h3>${Number(ahorro.saldo_ahorrado).toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-info mb-3 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Meta de Ahorro</h5>
                <h3>${Number(ahorro.meta_ahorro).toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Renderizado condicional basado en privilegios de rol */}
        {esPersonalAutorizado ? (
          <div className="card mb-4 no-print shadow-sm">
            <div className="card-header bg-light"><b>Registrar Movimiento (Ventanilla / Caja)</b></div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleTransaccion} className="row g-3 align-items-center">
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={formTx.tipo}
                    onChange={(e) => setFormTx({ ...formTx, tipo: e.target.value })}
                  >
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso (Gasto)</option>
                    <option value="ahorro">Mover a Ahorro</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="Monto $"
                    value={formTx.monto}
                    onChange={(e) => setFormTx({ ...formTx, monto: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Descripción breve..."
                    value={formTx.descripcion}
                    onChange={(e) => setFormTx({ ...formTx, descripcion: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary w-100">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning no-print shadow-sm mb-4">
            ⚠️ <b>Modo de Vista Consulta:</b> Como cliente, no tienes permitido procesar transacciones directas en la plataforma. Acércate a una sucursal para realizar depósitos o retiros físicos.
          </div>
        )}

        {/* Tabla de Historial */}
        <div className="card shadow-sm">
          <div className="card-header bg-light"><b>Historial de Transacciones</b></div>
          <div className="card-body">
            <table className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th className="text-end">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-muted">No hay movimientos aún.</td></tr>
                ) : (
                  transacciones.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.fecha).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${tx.tipo === 'ingreso' ? 'bg-success' : tx.tipo === 'egreso' ? 'bg-danger' : 'bg-primary'}`}>
                          {tx.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td>{tx.descripcion}</td>
                      <td className={`text-end fw-bold ${tx.tipo === 'ingreso' ? 'text-success' : 'text-dark'}`}>
                        {tx.tipo === 'egreso' ? '-' : '+'}${Number(tx.monto).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}

export default DashboardAhorros;