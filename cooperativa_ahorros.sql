-- 1. Creación de la Base de Datos
CREATE DATABASE IF NOT EXISTS cooperativa_ahorros;
USE cooperativa_ahorros;

-- 2. Tabla de Usuarios
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'usuario') DEFAULT 'usuario',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabla de Ahorros (Relación 1:1 con Usuarios)
CREATE TABLE ahorros (
    id_usuario VARCHAR(36) PRIMARY KEY,
    saldo_disponible DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    meta_ahorro DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    saldo_ahorrado DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabla de Transacciones (Relación 1:N con Usuarios)
CREATE TABLE transacciones (
    id VARCHAR(20) PRIMARY KEY,
    id_usuario VARCHAR(36) NOT NULL,
    tipo ENUM('ingreso', 'egreso', 'ahorro') NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    descripcion VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;