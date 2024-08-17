import mongoose from "mongoose";
import { like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";
import {Apiresponse} from "../utils/apiresponse.js";
import {asynchandler} from "../utils/asynchandler.js"
import {client} from '../index.js'

const getChannelStats = asynchandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id;

    const cachedStats = await client.get(`${userId}-stats`).catch(err => {
        console.error('Redis Get Error:', err);
        return null;
    });

    if (cachedStats) {
        return res.status(200).json(new Apiresponse(200, JSON.parse(cachedStats), "Channel stats fetched successfully"));
    }

    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                subscribersCount: {
                    $sum: 1
                }
            }
        }
    ]);

    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $project: {
                totalLikes: {
                    $size: "$likes"
                },
                totalViews: "$views",
                totalVideos: 1
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$totalLikes"
                },
                totalViews: {
                    $sum: "$totalViews"
                },
                totalVideos: {
                    $sum: 1
                }
            }
        }
    ]);

    const channelStats = {
        totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
        totalLikes: video[0]?.totalLikes || 0,
        totalViews: video[0]?.totalViews || 0,
        totalVideos: video[0]?.totalVideos || 0
    };

    await client.set(`${userId}-stats`, JSON.stringify(channelStats), 'EX', 3600).catch(err => console.error('Redis Set Error:', err));

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
                channelStats,
                "channel stats fetched successfully"
            )
        );
});

const getChannelVideos = asynchandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id;

    const cachedVideos = await client.get(`${userId}-channelvideos`).catch(err => {
        console.error('Redis Get Error:', err);
        return null;
    });

    if (cachedVideos) {
        return res.status(200).json(new Apiresponse(200, JSON.parse(cachedVideos), "Videos fetched successfully"));
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                createdAt: {
                    $dateToParts: { date: "$createdAt" }
                },
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                "videoFile.url": 1,
                "thumbnail.url": 1,
                title: 1,
                description: 1,
                createdAt: {
                    year: 1,
                    month: 1,
                    day: 1
                },
                isPublished: 1,
                likesCount: 1
            }
        }
    ]);

    await client.set(`${userId}-channelvideos`, JSON.stringify(videos), 'EX', 3600).catch(err => console.error('Redis Set Error:', err));
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "channel stats fetched successfully"
        )
    );
});

export { getChannelStats, getChannelVideos };