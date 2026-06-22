import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function DashboardAhorros() {
  const [ahorro, setAhorro] = useState({ saldo_disponible: 0, meta_ahorro: 0, saldo_ahorrado: 0 });
  const [transacciones, setTransacciones] = useState([]);
  const [formTx, setFormTx] = useState({ tipo: 'ingreso', monto: '', descripcion: '' });
  const [error, setError] = useState('');


  const cargarDatos = async () => {
    
    const usuarioLogueado = JSON.parse(localStorage.getItem('user'));
    if (!usuarioLogueado) return;

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
      const response = await fetch('http://localhost:5000/transacciones', {
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
          <h2>Mi Estado de Cuenta</h2>
          <button className="btn btn-secondary no-print" onClick={handlePrintPDF}>
             Imprimir Reporte (PDF)
          </button>
        </div>

       
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary mb-3">
              <div className="card-body">
                <h5 className="card-title">Saldo Disponible</h5>
                <h3>${Number(ahorro.saldo_disponible).toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success mb-3">
              <div className="card-body">
                <h5 className="card-title">Ahorrado</h5>
                <h3>${Number(ahorro.saldo_ahorrado).toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-info mb-3">
              <div className="card-body">
                <h5 className="card-title">Meta de Ahorro</h5>
                <h3>${Number(ahorro.meta_ahorro).toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4 no-print shadow-sm">
          <div className="card-header bg-light"><b>Registrar Movimiento</b></div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleTransaccion} className="row g-3 align-items-center">
              <div className="col-md-3">
                <select 
                  className="form-select" 
                  value={formTx.tipo} 
                  onChange={(e) => setFormTx({...formTx, tipo: e.target.value})}
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso (Gasto)</option>
                  <option value="ahorro">Mover a Ahorro</option>
                </select>
              </div>
              <div className="col-md-3">
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Monto $" 
                  value={formTx.monto} 
                  onChange={(e) => setFormTx({...formTx, monto: e.target.value})}
                  required 
                />
              </div>
              <div className="col-md-4">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Descripción breve..." 
                  value={formTx.descripcion} 
                  onChange={(e) => setFormTx({...formTx, descripcion: e.target.value})}
                  required 
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">Guardar</button>
              </div>
            </form>
          </div>
        </div>

    
        <div className="card shadow-sm">
          <div className="card-header bg-light"><b>Historial de Transacciones</b></div>
          <div className="card-body">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.length === 0 ? (
                  <tr><td colSpan="4" className="text-center">No hay movimientos aún.</td></tr>
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
                      <td>${Number(tx.monto).toFixed(2)}</td>
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