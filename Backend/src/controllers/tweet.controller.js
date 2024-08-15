import { asynchandler as asyncHandler } from "../utils/asynchandler.js";
import { Apierror as ApiError } from "../utils/apierror.js";
import { Tweet } from "../models/tweet.model.js";
import { Apiresponse as ApiResponse } from "../utils/apiresponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";

const createTweet = asyncHandler(async (req, res) => {
const {content}=req.body;
try {
    if(!content){
        throw new Apierror(400,"tweet content is requird")
    }
   const tweet = await Tweet.create({
    content,
    owner:req.user?._id
   })
   if(!tweet){
    throw new Apierror(400,"tweet content is requird")
   }
   return res
   .status(200)
   .json(new ApiResponse(200,tweet,"tweet successfully"))

} 

catch (error) {
    console.log(error)
} 
})

const updateTweet = asyncHandler(async (req, res) => {
        const {content}=req.body;
        const {tweetid}=req.params;
            if(!content){
                throw new Apierror(400,"tweet content is requird")
            }
            if (!isValidObjectId(tweetId)) {
                throw new ApiError(400, "Invalid tweetId");
            }
            const tweet = await Tweet.findById(tweetid);

            if (!tweet) {
                throw new ApiError(404, "Tweet not found");
            }
        
            if (tweet?.owner.toString() !== req.user?._id.toString()) {
                throw new ApiError(400, "only owner can edit thier tweet");
            }
         const UpdateTweet= await Tweet.findByIdAndUpdate( 
             tweetid,
            {
                $set: {
                    content,
                },
            },
            { new: true }
        )
           if (!updateTweet) {
            throw new ApiError(500, "Failed to edit tweet please try again");
        }
    
        return res
            .status(200)
            .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"));
            
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can delete thier tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(200, {tweetId}, "Tweet deleted successfully"));
});
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails",
                },
                ownerDetails: {
                    $first: "$ownerDetails",
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likeDetails.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            },
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                ownerDetails: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});
export 
{
createTweet,
updateTweet,
deleteTweet,
getUserTweets
}