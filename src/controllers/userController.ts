import { Request, Response } from "express"
import { Users } from "../models/userModel"
import { db } from "../config/db";
import { ResultSetHeader } from "mysql2";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import { loginSchema } from "../utils/validation";
import { SessionManager } from "../services/sessionManager";


export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {error} = loginSchema.validate(req.body);
        if(error){
            res.status(400).json({message: error.details[0].message});
            return;
        }

        const { name, email, password } = req.body as Omit<Users, "id">

        if (!name || !email || !password) {
            res.status(400).json({ message: "Required fields" });
            return;
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const [result] = await db.query<ResultSetHeader>("INSERT INTO users (name , email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
        const insertid = result.insertId;

        const token = jwt.sign({ id: insertid, email }, process.env.JWT_SECRET as string, { expiresIn: "1d" });

        res.status(200).json({ result, token });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error(error)
    }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {

        const {error} = loginSchema.validate(req.body);
        if(error){
            res.status(400).json({message: error.details[0].message});
            return;
        }

        const { email, password } = req.body as Omit<Users, "id">
        if (!email || !password) {
            res.status(400).json({ message: "Required fields" });
            return;
        }
        const [rows] = await db.query<any[]>("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
        if (rows.length === 0) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const user = rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: "1d" });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'strict' as const
        })

        res.status(200).json({ user, token });

    } catch (error) {

    }
} 