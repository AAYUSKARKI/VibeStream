import { asynchandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

        user.refreshtoken = refreshtoken
        await user.save({ validateBeforeSave: false })

        return { accesstoken, refreshtoken }
    } catch (error) {
        throw new Apierror(500, "something wwnt wrong while genrating refresh anf aveessstoken")
    }
}






const registerUser = asynchandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exist :username,email
    //check for image,avatar
    //upload on cloudinary
    //create user object - create entry in db
    //remove password and refresh tokenfield from response
    //check for user creation 
    //return res
    const { fullname, email, username, password } = req.body
    console.log("email:", email);

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new Apierror(400, "All fields are required")
    }

    const existeduser = await User.findOne({
        $or: [
            { username }, { email }
        ]
    })

    if (existeduser) { throw new Apierror(409, "User with Email or Username already exist") }

    const avatarlocalpath = req.files?.avatar[0]?.path
    const coverImagelocalpath = req.files?.coverImage[0]?.path
    console.log("Avatar file received:", req.files?.avatar);
    if (!avatarlocalpath) {
        throw new Apierror(400, "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarlocalpath)
    const coverImage = await uploadOnCloudinary(coverImagelocalpath)

    if (!avatar) {
        throw new Apierror(400, "Avatar file not uploaded")
    }
    const user = await User.create({
        fullname,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken")

    if (!createdUser) {
        throw new Apierror(500, "something went wrong while registering a user")
    }

    return res.status(201).json(
        new Apiresponse(200, createdUser, "User Registered sucesfully")
    )
})

const loginuser = asynchandler(async (req, res) => {
    const { email, username, password } = req.body
    console.log("username ", username);
    console.log("email ", email);
    console.log('Request headers:', req.headers);
    if (!username && !email) {
        throw new Apierror(400, "username or email is required")

    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new Apierror(404, "user doesnt exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new Apierror(404, "user password wrong")
    }


    const { accesstoken, refreshtoken } = await generateAccessAndRefreshToken(user._id)

    const loggedinUser = await User.findById(user._id).select("-password,-refreshtoken")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }

    return res.status(200).cookie("accesstoken", accesstoken, options)
        .cookie("refreshtoken", refreshtoken, options)
        .json(
            new Apiresponse(
                200,
                {
                    user: loggedinUser, accesstoken, refreshtoken
                },
                "Userlogged in successfully"
            )
        )
})


const logoutuser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshtoken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accesstoken", options).clearCookie("refreshtoken", options).json(new Apiresponse(200, {}, "user logout"))
})


const refreshaccesstoken = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshtoken || req.body.refreshtoken

    if (!incomingRefreshToken) {
        throw new Apierror(401, "unauthorized access")
    }

    try {
        const decodedtoken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedtoken?._id)
        if (!user) {
            throw new Apierror(401, "Invalid refresh token")
        }


        if (incomingRefreshToken !== user?.refreshtoken) {
            throw new Apierror(401, "Refres token is used or expire")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accesstoken, Newrefreshtoken } = await generateAccessAndRefreshToken(user._id)

        return res.status(200).cookie("accestoken", accesstoken, options)
            .cookie("refreshtoken", Newrefreshtoken, options)
            .json(
                new Apiresponse(201, "acess token refreshed")
            )
    } catch (error) {
        throw new Apierror(401, error?.message || "invalid accesstoken")
    }
})






const changecurrentpassword = asynchandler(async (req, res) => {
    const { oldpassword, newpassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldpassword)

    if (!isPasswordCorrect) {
        throw new Apierror(400, "invalid old password")
    }

    user.password = newpassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new Apiresponse(200, {}, "password Chamge successfully"))
})


const getcurrentuser = asynchandler(async () => {   
    return res.status(200).json(new Apiresponse(200, req.user, "current user fetched successfully"))
})

const updateaccountdetails = asynchandler(async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname || !email) {
        return Apierror(400, "all fields are required ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname, // same as fullname:fullname
                email: email // same as email
            }
        },
        { new: true }).select("-password")

    return res.status(200).json(new Apiresponse(200, user, "account details updated successfully"))
})



const updateuseravatar = asynchandler(async (req, res) => {
    const avatarlocalpath = req.file?.path

    if (!avatarlocalpath) {
        throw new Apierror(400, "Avatar file is missing ")
    }

    const avatar = await uploadOnCloudinary(avatarlocalpath)

    if (!avatar.url) {
        throw new Apierror(400, "error while upload on avatar ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select(-"password")

    return res
        .status(200)
        .json(new Apiresponse(200, user, "avatar updated successfully"))
})

const updateusercoverimage = asynchandler(async (req, res) => {
    const coverImagelocalpath = req.file?.path

    if (!coverImagelocalpath) {
        throw new Apierror(400, "cover image fiole is missing ")
    }

    const coverImage = await uploadOnCloudinary(coverImagelocalpath)

    if (!coverImage.url) {
        throw new Apierror(400, "error while upload on coverimage ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                coverimage: coverImage.url
            }
        },
        { new: true }).select(-"password")

    return res
        .status(200)
        .json(new Apiresponse(200, user, "coverimageupdatedsuccessfully"))
})


const getuserchannelprofile = asynchandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new Apierror(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberscount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscribe"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscriberscount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    // console.log(channel)
    if (!channel?.length) {
        throw new Apierror(400, "channel doesnt exist")
    }

    return res.status(200)
        .json(new Apiresponse(200, channel[0], "user channel fetched successfully"))
})



const getwatchhistory = asynchandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchhistory",
                foreignField: "_id",
                as: "watchhistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "Owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }, {
                        $addFields: {
                            owner: {
                                $first: "$Owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
return res.status(200).json(
    new Apiresponse(200,user[0].watchhistory,"watch history fetched succesfully")
)
})

const addWatchHistory = asynchandler(async (req, res) => {
    const { videoId } = req.body;
    const userId = req.user._id;

    if (!videoId) {
        throw new Apierror(400, "Video ID is required");
    }

    // Find the user and update the watch history
    const user = await User.findById(userId);

    if (!user) {
        throw new Apierror(404, "User not found");
    }

    // Check if the video is already in the watch history
    if (user.watchhistory.includes(videoId)) {
        return res.status(200).json(new Apiresponse(200, null, "Video already in watch history"));
    }

    // Add the video ID to the watch history
    user.watchhistory.push(videoId);

    // Save the updated user document
    await user.save();

    return res.status(200).json(new Apiresponse(200, user.watchhistory, "Video added to watch history successfully"));
});

export {
    registerUser,
    loginuser,
    logoutuser,
    refreshaccesstoken,
    changecurrentpassword,
    getcurrentuser,
    updateaccountdetails,
    updateuseravatar,
    updateusercoverimage,
    getuserchannelprofile,
    getwatchhistory,
    addWatchHistory
}
