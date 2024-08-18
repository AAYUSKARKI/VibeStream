import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/apiresponse.js";
import { asynchandler as asyncHandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import { client, videoUpdateQueue } from "../index.js";
const getAllVideos = asyncHandler(async (req, res) => {
    const cachedvideos = await client.get('Videos-All').catch(err => {
        console.error('Redis Get Error:', err);
        return null;
    });
    
    if (cachedvideos) {
        return res.status(200).json(new Apiresponse(200, JSON.parse(cachedvideos), "Videos fetched successfully"));
    }

    const Videos = await Video.find().populate('owner', 'username avatar');
    client.set('Videos-All', JSON.stringify(Videos), 'EX', 3600).catch(err => console.error('Redis Set Error:', err));
    return res.status(200).json(new Apiresponse(200, Videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description,category,tags } = req.body;

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
        owner: req.user._id,
        category,
        tags
    });

    return res.status(201).json(new Apiresponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    console.log(videoId)
    // let userId = req.body;

    const cachedvideo = await client.get(`VideoById-${videoId}`).catch(err => {
        console.error('Redis Get Error:', err);
        return null;
    });

    if (cachedvideo) {
        videoUpdateQueue.add({videoId, userid: req.user?._id});
        return res.status(200).json(new Apiresponse(200, JSON.parse(cachedvideo), "Video fetched successfully"));
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
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
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [
                                            req.user?._id,
                                            "$subscribers.subscriber"
                                        ]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likes.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                videofile: 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                comments: 1,
                owner: 1,
                likesCount: 1,
                isLiked: 1
            }
        }
    ]);

    if (!video) {
        throw new Apierror(500, "failed to fetch video");
    }

    client.set(`VideoById-${videoId}`, JSON.stringify(video[0]), 'EX', 3600).catch(err => console.error('Redis Set Error:', err));

    videoUpdateQueue.add({videoId, userid: req.user?._id});
    return res
        .status(200)
        .json(
            new Apiresponse(200, video, "video details fetched successfully")
        );
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

const SearchVideos = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query || query.trim().length === 0 || typeof query !== 'string') {
        throw new Apierror(400, "Invalid search query");
    }
    const videos = await Video.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { category: { $regex: query, $options: 'i' } }
        ]
    }).populate('owner', 'username avatar');

    if (!videos || videos.length === 0) {
        throw new Apierror(404, "No videos found for the given search query");
    }
    return res.status(200).json(new Apiresponse(200, videos, "Videos fetched successfully"));
});

const searchSuggestions = asyncHandler(async (req, res) => {
    const { query } = req.query;

    // Validate the query parameter
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new Apierror(400, "Invalid search query");
    }

    const searchTerm = query.trim();

    try {
        // Perform the search with regex for case-insensitive matching
        const videos = await Video.find({ title: { $regex: searchTerm, $options: 'i' } });

        // Map video titles to an array
        const videoTitles = videos.map(video => video.title);

        return res.status(200).json(new Apiresponse(200, videoTitles, "Videos fetched successfully"));
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json(new Apiresponse(500, null, "An error occurred while fetching suggestions"));
    }
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getMyVideos,
    RecommendedVideos,
    SearchVideos,
    searchSuggestions
};
