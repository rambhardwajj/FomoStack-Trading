import { Router } from "express";
import { closeOrder, getLiquidatingOrders, openOrder } from "../controllers/order.controller.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router: Router = Router();

router.post('/create', isLoggedIn, openOrder );

router.post('/liquidate', getLiquidatingOrders )

router.post('/close-order', closeOrder )



export default router; 