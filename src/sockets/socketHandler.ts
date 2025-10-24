import { Server as HttpServer } from "http";
import { Server as IOServer, Socket } from "socket.io";

import { verify } from "jsonwebtoken";
import { SessionManager } from "../services/sessionManager";

export let io: IOServer;

export const socketHandler = (httpServer: HttpServer) => {
    const io = new IOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication error"));
            }
            const payloadRaw = verify(token, process.env.JWT_SECRET!);

            if (typeof payloadRaw !== "object" || payloadRaw === null || !("userId" in payloadRaw) || !("jti" in payloadRaw)) {
                return next(new Error("Authentication error"));
            }
            const payload = payloadRaw as { userId: string; jti: string; [key: string]: any };

            const valid = await SessionManager.verifyActiveJTI(payload.userId, payload.jti);
            if (!valid) {
                return next(new Error("Invalid session"));
            }
            (socket as any).user = payload;
            next();
        } catch (error) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket: Socket) => {
        console.log(`User connected: ${(socket as any).user.id}`);
        socket.on("joinRoom", (roomId: string) => {
            socket.join(roomId);
            console.log(`User ${(socket as any).user.id} joined room: ${roomId}`);
        });

        socket.on("leave", (room: string) => {
            socket.leave(room);
            socket.emit("left", room);
        });

        socket.on("message", (data: { roomId: string; message: string }) => {
            io.to(data.roomId).emit("message", {
                userId: (socket as any).user.id,
                message: data.message,
            });
        });

        socket.on('disconnect', (reason) => {
            console.log(`socket disconnected , ${socket.id, reason}`);
        });
    });
    return io;
}
