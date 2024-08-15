import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/apiresponse.js";
import { asynchandler as asyncHandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import { client } from "../index.js";
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc' } = req.query;

    const pipeline = [
        {
            $match: {
                ispublished: true,
                ...(query && { $text: { $search: query } })
            }
        },
        {
            $sort: { [sortBy]: sortType === 'asc' ? 1 : -1 }
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: (page - 1) * limit }, { $limit: parseInt(limit) }]
            }
        },
        {
            $addFields: {
                total: { $arrayElemAt: ["$metadata.total", 0] }
            }
        }
    ];

    const result = await Video.aggregate(pipeline);

    return res.status(200).json(new Apiresponse(200, result, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!req.files || !req.files.video || !req.files.thumbnail) {
        throw new Apierror(400, "Video file and thumbnail are required");
    }

    const videoFilePath = req.files.video[0].path;
    const thumbnailFilePath = req.files.thumbnail[0].path;

    const video = await uploadOnCloudinary(videoFilePath);
    const thumbnail = await uploadOnCloudinary(thumbnailFilePath);
    
    console.log(video)
    if (!video.url || !thumbnail.url) {
        throw new Apierror(400, "Error uploading video or thumbnail");
    }

    const newVideo = await Video.create({
        title,
        description,
        videofile: video.secure_url,
        thumbnail: thumbnail.secure_url,
        duration: video.duration,
        owner: req.user._id
    });

    return res.status(201).json(new Apiresponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoID } = req.params;

    // Aggregation pipeline to fetch video details along with likes count
    const videoWithLikes = await Video.aggregate([
        {
            // Match the video by ID
            $match: { _id: new mongoose.Types.ObjectId(videoID) }
        },
        {
            // Lookup to join the owner details
            $lookup: {
                from: 'users', // The name of the users collection
                localField: 'owner',
                foreignField: '_id',
                as: 'owner'
            }
        },
        {
            // Unwind the ownerDetails array (since it's a single owner)
            $unwind: '$owner'
        },
        {
            // Lookup to count likes related to the video
            $lookup: {
                from: 'likes', // The name of the likes collection
                localField: '_id',
                foreignField: 'video',
                as: 'likes'
            }
        },
        {
            // Add fields to include likes count
            $addFields: {
                likesCount: { $size: '$likes' },
                likes: '$likes',
            }
        },
        {
            // Project the necessary fields
            $project: {
                _id: 1,
                title: 1,
                videofile: 1,
                owner: {
                    username: 1,
                    avatar: 1,
                },
                likesCount: 1,
                likes: {
                    likedBy: 1,
                }
            }
        }
    ]);

    // Check if video was found
    if (!videoWithLikes || videoWithLikes.length === 0) {
        throw new Apierror(404, "Video not found");
    }

    return res.status(200).json(new Apiresponse(200, videoWithLikes[0], "Video fetched successfully"));
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid video ID");
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (thumbnail) {
        const thumbnailPath = req.file?.path;
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath);
        if (!uploadedThumbnail.url) {
            throw new Apierror(400, "Error uploading thumbnail");
        }
        updateFields.thumbnail = uploadedThumbnail.url;
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, updateFields, { new: true });

    if (!updatedVideo) {
        throw new Apierror(404, "Video not found");
    }

    return res.status(200).json(new Apiresponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid video ID");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new Apierror(404, "Video not found");
    }

    return res.status(200).json(new Apiresponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new Apierror(404, "Video not found");
    }

    video.ispublished = !video.ispublished;
    await video.save();

    return res.status(200).json(new Apiresponse(200, video, `Video ${video.ispublished ? 'published' : 'unpublished'} successfully`));
});

const getMyVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString(); // Ensure user ID is a string
    const cachedvideos = await client.get(userId).catch(err => {
        console.error('Redis Get Error:', err);
        return null;
    });

    if (cachedvideos) {
        return res.status(200).json(new Apiresponse(200, JSON.parse(cachedvideos), "Videos fetched successfully"));
    }

    const videos = await Video.find({ owner: req.user._id }).populate('owner', 'username avatar');

    await client.set(userId, JSON.stringify(videos), 'EX', 3600).catch(err => console.error('Redis Set Error:', err));

    return res.status(200).json(new Apiresponse(200, videos, "Videos fetched successfully"));
});

const RecommendedVideos = asyncHandler(async (req, res) => {
    const cachedvideos = await client.get(`RecommendedVideos`).catch(err => {
        console.error('Redis Get Error:', err);
        return null;
    });

    if (cachedvideos) {
        return res.status(200).json(new Apiresponse(200, JSON.parse(cachedvideos), "Videos fetched successfully"));
    }

    const videos = await Video.find().populate('owner', 'username avatar');

    await client.set(`RecommendedVideos`, JSON.stringify(videos), 'EX', 3600).catch(err => console.error('Redis Set Error:', err));

    return res.status(200).json(new Apiresponse(200, videos, "Videos fetched successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getMyVideos,
    RecommendedVideos
};
