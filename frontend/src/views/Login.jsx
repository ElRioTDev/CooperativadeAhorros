import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
     
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      

      localStorage.setItem('user', JSON.stringify(data.user)); 
    
      navigate('/ahorros'); 
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Iniciar Sesión</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Usuario o Email</label>
              <input 
                type="text" 
                name="email"
                className="form-control" 
                placeholder="Ingresa tu usuario" 
                onChange={handleChange}
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input 
                type="password" 
                name="password"
                className="form-control" 
                placeholder="••••••••" 
                onChange={handleChange}
                required 
              />
            </div>
            <div className="d-grid gap-2 mt-4">
              <button type="submit" className="btn btn-primary btn-lg">
                Entrar
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
            <a href="#" className="text-decoration-none">¿Olvidaste tu contraseña?</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;