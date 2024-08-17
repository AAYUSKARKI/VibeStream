import dotenv from "dotenv";
import connectdb from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import cors from 'cors'
import { Server } from "socket.io";
import Queue from 'bull';
import { createClient } from 'redis';
import { Video } from "./models/video.model.js";
import { User } from "./models/user.model.js";

export const client = createClient({
    password: 'VlYEfYOB30E3b2BYzE5t1WwsE7VKAiGb',
    socket: {
        host: 'redis-10902.c1.asia-northeast1-1.gce.redns.redis-cloud.com',
        port: 10902
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.connect().then(()=>console.log('connected to redis'));

dotenv.config({path : './env'})
 let io;
 const videoUpdateQueue = new Queue('video_update_queue', {
    redis: {
        host: 'redis-10902.c1.asia-northeast1-1.gce.redns.redis-cloud.com',
        port: 10902,
        password: 'VlYEfYOB30E3b2BYzE5t1WwsE7VKAiGb'
    }
})

videoUpdateQueue.process(async (job) => {
    const { videoId, userid } = job.data;

    await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1
        }
    });

    if (userid) {
        await User.findByIdAndUpdate(userid, {
            $addToSet: {
                watchHistory: videoId
            }
        });
    }

    return {success: true}
})

videoUpdateQueue.on('completed', (job) => {
    console.log('Job completed', job.data);
})

videoUpdateQueue.on('failed', (job, err) => {
    console.log('Job failed', job.data, err);
})


connectdb()
    .then(() => {
        const server = http.createServer(app);

        // Initialize Socket.IO
        io = new Server(server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"]
            }
        });

        io.on("connection", (socket) => {
            console.log(`Socket ${socket.id} connected`);

            // Handle disconnection
            socket.on("disconnect", () => {
                console.log(`Socket ${socket.id} disconnected`);
            });
        });

        // Start listening after successful DB connection
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to the database:', err);
        process.exit(1);  // Exit the process if DB connection fails
    });

    export {io,videoUpdateQueue}
