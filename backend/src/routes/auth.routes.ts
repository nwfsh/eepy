import { Router } from "express";
import { registerHandler, signInHandler, refreshHandler, signOutHandler } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", registerHandler); // no tokens created yet
router.post("/signin", signInHandler); // just creating tokens 
router.post("/refresh", refreshHandler); // your access token is already dead, using refresh tokens -> to create both tokens
router.post("/signout", requireAuth, signOutHandler); // u need access token to be able to finally delete ur resfresh token - safer

export default router;