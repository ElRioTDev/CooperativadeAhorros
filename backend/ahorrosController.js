import pool from './dbHelper.js';
import crypto from 'crypto';

export const getAhorros = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        // 1. Obtener los datos de ahorro del usuario
        const [ahorrosRows] = await pool.query(
            'SELECT * FROM ahorros WHERE id_usuario = ?',
            [id_usuario]
        );

        let ahorro = ahorrosRows[0];

        // Si por alguna razón no tiene registro de ahorros, devolvemos uno en cero
        if (!ahorro) {
            ahorro = { id_usuario, saldo_disponible: 0, meta_ahorro: 0, saldo_ahorrado: 0 };
        }

        // 2. Obtener el historial de transacciones ordenado de más reciente a más antiguo
        const [transacciones] = await pool.query(
            'SELECT * FROM transacciones WHERE id_usuario = ? ORDER BY fecha DESC',
            [id_usuario]
        );

        res.json({ success: true, ahorro, transacciones });

    } catch (error) {
        console.error("Error al obtener datos de ahorro:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

export const registrarTransaccion = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id_usuario, tipo, monto, descripcion } = req.body;
        const numMonto = parseFloat(monto);

        if (!tipo || isNaN(numMonto) || numMonto <= 0) {
            connection.release();
            return res.status(400).json({ message: "Datos inválidos." });
        }

        // INICIAMOS LA TRANSACCIÓN SQL
        await connection.beginTransaction();

        // 1. Buscamos la cuenta y la BLOQUEAMOS temporalmente (FOR UPDATE)
        // Esto evita que otras peticiones modifiquen el saldo mientras calculamos
        const [ahorrosRows] = await connection.query(
            'SELECT * FROM ahorros WHERE id_usuario = ? FOR UPDATE',
            [id_usuario]
        );

        if (ahorrosRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: "Cuenta no encontrada." });
        }

        const ahorro = ahorrosRows[0];

        // En MySQL, los campos DECIMAL se devuelven como strings para no perder precisión en JS.
        // Los convertimos a Float para hacer las validaciones matemáticas.
        let saldoDisponibleActual = parseFloat(ahorro.saldo_disponible);
        let saldoAhorradoActual = parseFloat(ahorro.saldo_ahorrado);

        // 2. Validar que haya fondos suficientes
        if ((tipo === 'egreso' || tipo === 'ahorro') && saldoDisponibleActual < numMonto) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: "Saldo insuficiente." });
        }

        // 3. Calcular los nuevos saldos
        if (tipo === 'ingreso') {
            saldoDisponibleActual += numMonto;
        } else if (tipo === 'egreso') {
            saldoDisponibleActual -= numMonto;
        } else if (tipo === 'ahorro') {
            saldoDisponibleActual -= numMonto;
            saldoAhorradoActual += numMonto;
        }

        // 4. Actualizar los saldos en la tabla 'ahorros'
        await connection.query(
            'UPDATE ahorros SET saldo_disponible = ?, saldo_ahorrado = ? WHERE id_usuario = ?',
            [saldoDisponibleActual, saldoAhorradoActual, id_usuario]
        );

        // 5. Generar ID y registrar la nueva transacción en la tabla 'transacciones'
        const idTransaccion = "tx_" + crypto.randomBytes(4).toString('hex');

        await connection.query(
            'INSERT INTO transacciones (id, id_usuario, tipo, monto, descripcion) VALUES (?, ?, ?, ?, ?)',
            [idTransaccion, id_usuario, tipo, numMonto, descripcion]
        );

        // 6. CONFIRMAR TODOS LOS CAMBIOS
        await connection.commit();
        connection.release();

        res.json({ success: true, message: "Transacción registrada." });

    } catch (error) {
        // SI OCURRE CUALQUIER ERROR, DESHACEMOS LA TRANSACCIÓN
        await connection.rollback();
        connection.release();
        console.error("Error al registrar la transacción:", error);
        res.status(500).json({ message: "Error al registrar la transacción." });
    }
};