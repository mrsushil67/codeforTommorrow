import express, { Application, Request, Response } from 'express';
const app : Application = express();
import { dbConnection } from './config/db';
import userRouter from './routes/userRoute'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandlingMiddleware } from './middleware/errorHandlingMiddleware';

const PORT = 3000
dbConnection();

app.get('/', (req: Request, res: Response) => {
    res.send("server check");
})

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());
app.use(errorHandlingMiddleware);

app.use('/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})