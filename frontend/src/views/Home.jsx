import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid p-0">
      
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
        <a className="navbar-brand font-weight-bold" href="#">Cooperativa AC</a>
        <div className="ml-auto">
   
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </button>
           <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/register')}
          >
            Registrarse
          </button>
        </div>
      </nav>

   
      <header className="bg-primary text-white text-center py-5">
        <div className="container">
          <h1 className="display-4">Cooperativa de Ahorro y Crédito</h1>
          <p className="lead">Gestión financiera inteligente para socios, clientes y empresas.</p>
          <button className="btn btn-light btn-lg mt-3">Comenzar ahora</button>
        </div>
      </header>


      <section className="container my-5">
        <div className="row text-center">
          <div className="col-md-4">
            <h3>Para Socios</h3>
            <p>Invierte en el desarrollo de cuentas y gestiona múltiples activos financieros con transparencia.</p>
          </div>
          <div className="col-md-4">
            <h3>Para Clientes</h3>
            <p>Administración eficiente de tus necesidades financieras mediante cuentas únicas y seguras.</p>
          </div>
          <div className="col-md-4">
            <h3>Supervisión Expertos</h3>
            <p>Todo el flujo de transacciones es auditado por personal capacitado para garantizar el éxito.</p>
          </div>
        </div>
      </section>


      <footer className="bg-dark text-white text-center py-4">
        <p>&copy; 2026 Cooperativa de Ahorro. Gestión bancaria profesional.</p>
      </footer>
    </div>
  );
}

export default Home;