import express, { urlencoded } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { upload } from "./middlewares/multer.middleware.js";
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json({limit:"400mb"}))
app.use(express.urlencoded({extended:true,limit:"400mb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'
import vudeoRouter from './routes/video.routes.js'
import likeRouter from './routes/like.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",vudeoRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)

export { app }