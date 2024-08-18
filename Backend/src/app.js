import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import csurf from 'csurf';
import morgan from 'morgan';
import logger from "./utils/logger.js";
const app = express();

const allowedOrigins = ['https://vibestream.vercel.app', 'http://localhost:5173'];

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
app.use(helmet()); // Security headers
app.use(express.json({ limit: "400mb" }));
app.use(express.urlencoded({ extended: true, limit: "400mb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(csurf({ cookie: true })); // CSRF protection using cookies
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  headers: true, // Include rate limit headers in responses
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.http(message.trim()) } }));

// Routes import
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';
import likeRouter from './routes/like.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

// CSRF token route
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Global error handling
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).send('CSRF token validation failed');
  } else {
    logger.error(err.stack); // Use the logger to log errors
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
});

export { app };
