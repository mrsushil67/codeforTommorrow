import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "UnAuthorized" });

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decode;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
}