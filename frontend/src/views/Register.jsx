import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Register() {
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    ahorroInicial: '' // 🛠️ Nuevo campo de estado
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          ahorroInicial: formData.ahorroInicial // 🛠️ Enviamos el monto al backend
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al registrar el usuario');

      setSuccess('¡Registro exitoso con cuenta de ahorros activa! Redirigiendo...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Crear Cuenta</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre Completo</label>
              <input 
                type="text" 
                name="nombre"
                className="form-control" 
                placeholder="Ej. Juan Pérez" 
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                name="email"
                className="form-control" 
                placeholder="tu@correo.com" 
                onChange={handleChange}
                required 
              />
            </div>

            {/* 🛠️ NUEVO CAMPO: Depósito o Ahorro inicial de apertura */}
            <div className="mb-3">
              <label className="form-label">Monto de Apertura ($ - Opcional)</label>
              <input 
                type="number" 
                name="ahorroInicial"
                step="0.01"
                min="0"
                className="form-control" 
                placeholder="Ej. 50.00 (Dejar vacío para 0.00)" 
                onChange={handleChange}
              />
              <div className="form-text text-muted">Este saldo se asignará directamente a tu Saldo Disponible.</div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
                <label className="form-label">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  className="form-control" 
                  placeholder="••••••••" 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="d-grid gap-2 mt-4">
              <button type="submit" className="btn btn-success btn-lg">
                Registrarse
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
            <span>¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-decoration-none">Inicia sesión aquí</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;