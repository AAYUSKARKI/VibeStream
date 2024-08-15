import {createSubscription,getSubscribedchannel} from '../controllers/subscription.controller.js'
import {Router} from 'express'
import {verifyJWT} from '../middlewares/auth.middleware.js'

const router = Router()

router.route("/subscription").post(verifyJWT,createSubscription)
router.route("/videos/getsubscribedchannels").get(verifyJWT,getSubscribedchannel)


export default router