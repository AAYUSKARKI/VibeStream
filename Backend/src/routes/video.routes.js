import { verifyJWT } from "../middlewares/auth.middleware.js";
import {getAllVideos,
        publishAVideo,
        getVideoById,
        updateVideo,
        deleteVideo,
        togglePublishStatus,
        getMyVideos,
        RecommendedVideos,
        SearchVideos,
        searchSuggestions
    } from "../controllers/video.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/publish").post(verifyJWT,upload.fields([{name:"video"},{name:"thumbnail"}]), publishAVideo);
router.route("/myvideos").get(verifyJWT,getMyVideos);
router.route("/:videoID").get(verifyJWT,getVideoById);
router.route("/recommended/videos/recommended").get(verifyJWT,RecommendedVideos);
router.route("/search/videos/search").get(verifyJWT,SearchVideos);
router.route("/:videoID/publish").put(verifyJWT,togglePublishStatus);
router.route("/:videoID").put(verifyJWT,upload.fields([{name:"video"},{name:"thumbnail"}]),updateVideo);
router.route("/:videoID").delete(verifyJWT,deleteVideo);
router.route("/").get(verifyJWT,getAllVideos);
router.route("/search/suggestions").get(verifyJWT,searchSuggestions);
export default router