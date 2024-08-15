import mongoose from "mongoose";
import { like } from "../models/like.model.js";
import {Apiresponse} from "../utils/apiresponse.js";
import { Apierror } from "../utils/apierror.js";
import {asynchandler} from "../utils/asynchandler.js"
import {client} from '../index.js'
import {io} from "../index.js"

const createlikevideo = asynchandler(async (req, res) => {
    const { videoid } = req.body;
    const likedBy = req.user._id;
    
    if (!videoid) {
        throw new Apierror(400, "Video Id not found");
    }

    // Check if the video is already liked by the user
    const videoAlreadyliked = await like.findOne({ video: videoid, likedBy: likedBy });

    if (videoAlreadyliked) {
        io.emit('unlike', videoid);
        // If already liked, remove the like (unlike the video)
        await like.findByIdAndDelete({ _id: videoAlreadyliked._id });

        return res.status(200).json(
            new Apiresponse(200, null, "Video unliked successfully")
        );
    }

    // Create a new like entry
    const likevideo = await like.create({
        video: videoid,
        likedBy: likedBy
    });

    if (!likevideo) {
        throw new Apierror(500, "Failed to like video");
    }

    io.emit('like', videoid);

    return res.status(201).json(
        new Apiresponse(201, likevideo, "Video liked successfully")
    );
});


const getlikedvideos = asynchandler(async (req, res) => {
    const likedBy = req.user._id;

    //Check if the liked videos are already in the cache
    const cachedData = await client.get(`${likedBy.toString()}-like`).catch(err=>{
        console.error('Redis Get Error:', err);
        return null;
    })
    if(cachedData){
        return res.status(200).json(new Apiresponse(200, JSON.parse(cachedData), "like Videos fetched successfully"));
    }

        // Proceed with aggregation if data is not in cache
        const likedvideo = await like.aggregate([
            { $match: { likedBy: new mongoose.Types.ObjectId(likedBy) } },
            {
                $lookup: {
                    from: 'videos',
                    localField: 'video',
                    foreignField: '_id',
                    as: 'likedVideos'
                }
            },
            { $unwind: '$likedVideos' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'likedVideos.owner',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    owner:{
                        username: '$userDetails.username',
                        avatar: '$userDetails.avatar',
                    },
                    videofile: '$likedVideos.videofile',
                    title: '$likedVideos.title',
                    description: '$likedVideos.description',
                    duration: '$likedVideos.duration',
                    thumbnail: '$likedVideos.thumbnail',
                    views: '$likedVideos.views',
                    ispublished: '$likedVideos.ispublished',
                    createdAt: '$likedVideos.createdAt'
                }
            }
        ]);

        if (!likedvideo.length) {
            throw new Apierror(400, "Liked video doesn't exist");
        }

        // Cache the result
        await client.set(`${likedBy.toString()}-like`, JSON.stringify(likedvideo), 'EX', 3600).catch(err => console.error('Redis Set Error:', err));

        return res.status(200).json(new Apiresponse(200, likedvideo, "Liked videos fetched successfully"));
    });

export {
    createlikevideo,
    getlikedvideos
}
