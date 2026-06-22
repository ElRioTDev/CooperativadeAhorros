import pool from './dbHelper.js';
import crypto from 'crypto';

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Intento de login para:", email);

        // Buscamos al usuario por email o nombre
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ? OR nombre = ?',
            [email, email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos." });
        }

        const usuarioEncontrado = rows[0];

        // Nota: En un futuro, deberías usar bcrypt.compare() aquí en lugar de texto plano
        if (usuarioEncontrado.password !== password) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos." });
        }

        res.json({
            success: true,
            user: {
                id: usuarioEncontrado.id,
                name: usuarioEncontrado.nombre,
                email: usuarioEncontrado.email,
                role: usuarioEncontrado.role
            }
        });

    } catch (error) {
        console.error("Error en el controlador de autenticación:", error);
        res.status(500).json({ message: "Ocurrió un error inesperado en el servidor." });
    }
};

export const registerUser = async (req, res) => {
    // Obtenemos una conexión individual para manejar la transacción de forma segura
    const connection = await pool.getConnection();

    try {
        const { nombre, email, password } = req.body;

        // Comprobamos si el correo ya existe
        const [existingUsers] = await connection.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            connection.release(); // Siempre debemos liberar la conexión
            return res.status(400).json({ message: "Este correo ya está registrado." });
        }

        const nuevoId = crypto.randomUUID();

        // INICIAMOS LA TRANSACCIÓN
        await connection.beginTransaction();

        // 1. Insertar el usuario
        await connection.query(
            'INSERT INTO usuarios (id, nombre, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [nuevoId, nombre, email, password, 'cliente']
        );

        // 2. Insertar su registro de ahorros inicial (vinculado por llave foránea)
        await connection.query(
            'INSERT INTO ahorros (id_usuario, saldo_disponible, meta_ahorro, saldo_ahorrado) VALUES (?, ?, ?, ?)',
            [nuevoId, 0.00, 0.00, 0.00]
        );

        // SI AMBAS INSERCIONES SON EXITOSAS, CONFIRMAMOS LOS CAMBIOS EN LA BD
        await connection.commit();
        connection.release();

        res.status(201).json({ success: true, message: "Usuario registrado correctamente." });

    } catch (error) {
        // SI ALGO FALLA, DESHACEMOS TODOS LOS CAMBIOS DE LA TRANSACCIÓN
        await connection.rollback();
        connection.release();

        console.error("Error en el registro:", error);
        res.status(500).json({ message: "Error inesperado en el servidor." });
    }
};