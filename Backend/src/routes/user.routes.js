import { Router } from "express";
import {
    loginuser,
    registerUser,
    logoutuser,
    refreshaccesstoken,
    changecurrentpassword,
    getcurrentuser,
    updateaccountdetails,
    updateuseravatar,
    updateusercoverimage,
    getuserchannelprofile,
    getwatchhistory
}
    from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginuser)

//seruce routes
router.route("/logout").post(verifyJWT, logoutuser)
router.route("/refreshtoken").post(refreshaccesstoken)
router.route("/changepassword").post(verifyJWT, changecurrentpassword)
router.route("/currentuser").get(verifyJWT, getcurrentuser)
router.route("/updateaccount").patch(verifyJWT, updateaccountdetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateuseravatar)
router.route("/coverimage").patch(verifyJWT, upload.single("coverImage"), updateusercoverimage)
router.route("/c/:username").get(verifyJWT, getuserchannelprofile)
router.route("/history").get(verifyJWT, getwatchhistory)

export default router //can be imported by any name _eg RegisterUser