import fs from 'fs/promises';
import path from 'path';


const dbPath = path.resolve('database.json');


export const readDB = async () => {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al leer la base de datos JSON:", error);
        return null;
    }
};


export const writeDB = async (data) => {
    try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error("Error al guardar en la base de datos JSON:", error);
        return false;
    }
};