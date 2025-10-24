import { Router } from "express";
import { loginUser, registerUser } from "../controllers/userController";

const router = Router();

router.post('/sighUp', registerUser);
router.post('./signIn', loginUser);

export default router;