import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist, addtoPlaylist, getPlaylist, getmyPlaylist } from "../controllers/playlist.controller.js";
import { Router } from "express";
const router = Router();


router.route("/playlist").post(verifyJWT,createPlaylist)
router.route("/playlist/add").post(verifyJWT,addtoPlaylist)
router.route("/playlist/:playlistId").get(verifyJWT,getPlaylist)
router.route("/myplaylist").get(verifyJWT,getmyPlaylist)
export default router