import mysql from 'mysql2/promise';

// Configuración de la conexión a la base de datos
// Nota: En producción, es mejor usar variables de entorno (process.env)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Cambia por tu usuario de MySQL
    password: 'query_sql', // Cambia por tu contraseña de MySQL
    database: 'cooperativa_ahorros',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función auxiliar para comprobar la conexión al iniciar el servidor (opcional pero recomendada)
export const testDBConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Conexión exitosa a MySQL: cooperativa_ahorros");
        connection.release();
    } catch (error) {
        console.error("Error al conectar con la base de datos MySQL:", error);
    }
};

export default pool;