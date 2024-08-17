import express, { urlencoded } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { upload } from "./middlewares/multer.middleware.js";
const app = express();

const allowedOrigins = ['https://wish-me-liard.vercel.app', 'http://localhost:5173'];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST','DELETE','PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Foo'],
  credentials: true, 
};

app.use(cors(corsOptions));
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