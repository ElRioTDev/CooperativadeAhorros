import { readDB, writeDB } from './dbHelper.js';
import crypto from 'crypto';


export const getAhorros = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const db = await readDB();
        if (!db) return res.status(500).json({ message: "Error al leer base de datos." });

        let ahorro = db.ahorros.find(a => a.id_usuario === id_usuario);
        if (!ahorro) {
            ahorro = { id_usuario, saldo_disponible: 0, meta_ahorro: 0, saldo_ahorrado: 0 };
        }

    
        const transacciones = db.transacciones.filter(t => t.id_usuario === id_usuario);

        res.json({ success: true, ahorro, transacciones });
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor." });
    }
};


export const registrarTransaccion = async (req, res) => {
    try {
        const { id_usuario, tipo, monto, descripcion } = req.body;
        const numMonto = parseFloat(monto);

        if (!tipo || isNaN(numMonto) || numMonto <= 0) {
            return res.status(400).json({ message: "Datos inválidos." });
        }

        const db = await readDB();
        const ahorroIndex = db.ahorros.findIndex(a => a.id_usuario === id_usuario);
        
        if (ahorroIndex === -1) {
            return res.status(404).json({ message: "Cuenta no encontrada." });
        }

        const ahorro = db.ahorros[ahorroIndex];

       
        if ((tipo === 'egreso' || tipo === 'ahorro') && ahorro.saldo_disponible < numMonto) {
            return res.status(400).json({ message: "Saldo insuficiente." });
        }

    
        if (tipo === 'ingreso') {
            db.ahorros[ahorroIndex].saldo_disponible += numMonto;
        } else if (tipo === 'egreso') {
            db.ahorros[ahorroIndex].saldo_disponible -= numMonto;
        } else if (tipo === 'ahorro') {
            db.ahorros[ahorroIndex].saldo_disponible -= numMonto;
            db.ahorros[ahorroIndex].saldo_ahorrado += numMonto;
        }

       
        const nuevaTransaccion = {
            id: "tx_" + crypto.randomBytes(4).toString('hex'),
            id_usuario,
            tipo,
            monto: numMonto,
            fecha: new Date().toISOString(),
            descripcion
        };

        db.transacciones.push(nuevaTransaccion);
        await writeDB(db);

        res.json({ success: true, message: "Transacción registrada." });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar la transacción." });
    }
};