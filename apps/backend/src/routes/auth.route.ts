import { Router } from "express";
import { getUser, googleLogin, signin, signout, signup } from "../controllers/auth.controller.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router: Router = Router()

router.post("/login/google", googleLogin);

router.post("/signup", signup);

router.post("/signin", signin);

router.post('/signout', isLoggedIn,  signout)

router.get('/getUser', isLoggedIn, getUser)

export default router;