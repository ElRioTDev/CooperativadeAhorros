import express from 'express';
import cors from 'cors';
import { loginUser, registerUser } from './authController.js'; 
import { getAhorros, registrarTransaccion } from './ahorrosController.js';

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({ mensaje: "Servidor API activo." });
});

app.post('/login', loginUser);

app.post('/register', registerUser); 

app.get('/ahorros/:id_usuario', getAhorros);

app.post('/transacciones', registrarTransaccion);

app.listen(5000, () => {
    console.log("Servidor backend corriendo en http://localhost:5000");
});