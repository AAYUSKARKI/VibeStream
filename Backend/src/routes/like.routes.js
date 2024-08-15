import {
    createlikevideo,
    getlikedvideos
} from "../controllers/like.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/like").post(verifyJWT,createlikevideo)
router.route("/likedvideos").get(verifyJWT,getlikedvideos)

export default router