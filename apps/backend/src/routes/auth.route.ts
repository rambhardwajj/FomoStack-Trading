import { Router } from "express";
import { googleLogin, signin, signup } from "../controllers/auth.controller.js";

const router: Router = Router()

router.post("/login/google", googleLogin);

router.post("/signup", signup);

router.post("/signin", signin);

export default router;