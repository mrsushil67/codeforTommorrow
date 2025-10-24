import mysql, { RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "codefortommorrow",
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
})

export async function dbConnection():Promise<void>{
    try {
        const row = await db.query<RowDataPacket[]>('SELECT NOW() as now');
        console.log("Database connected : ", row[0])
    } catch (error) { 
        console.error("Error :",error);
    }
}