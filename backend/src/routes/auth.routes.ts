import { Router } from "express";
import { login, checkAuth } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, checkAuth);

export default router;