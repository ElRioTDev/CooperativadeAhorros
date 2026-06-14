import { readDB, writeDB } from './dbHelper.js';
import crypto from 'crypto';

export const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        console.log("Intento de login para:", email);

        const db = await readDB();
        
        if (!db) {
            return res.status(500).json({ message: "Error al conectar con la base de datos." });
        }

       
        const usuarioEncontrado = db.usuarios.find(
            user => user.email === email || user.nombre === email
        );

        if (!usuarioEncontrado || usuarioEncontrado.password !== password) {
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
    try {
        const { nombre, email, password } = req.body;

        const db = await readDB();
        if (!db) {
            return res.status(500).json({ message: "Error al conectar con la base de datos." });
        }

      
        const correoExistente = db.usuarios.find(user => user.email === email);
        if (correoExistente) {
            return res.status(400).json({ message: "Este correo ya está registrado." });
        }

        
        const nuevoUsuario = {
            id: crypto.randomUUID(), 
            nombre: nombre,
            email: email,
            password: password, 
            role: "usuario",
            fecha_registro: new Date().toISOString()
        };

        db.usuarios.push(nuevoUsuario);

      
        db.ahorros.push({
            id_usuario: nuevoUsuario.id,
            saldo_disponible: 0,
            meta_ahorro: 0,
            saldo_ahorrado: 0
        });

        
        const guardado = await writeDB(db);

        if (guardado) {
            res.status(201).json({ success: true, message: "Usuario registrado correctamente." });
        } else {
            res.status(500).json({ message: "No se pudo guardar el registro." });
        }

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ message: "Error inesperado en el servidor." });
    }
};