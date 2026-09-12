import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadToCloudinary} from '../utils/coludinery.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"
import mongoose from 'mongoose';
//import { verify } from 'jsonwebtoken';

const generateAccessAndReferesTokens =async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refereshToken = user.generateRefreshToken()

        user.refereshToken = refereshToken
        await user.save({validateBeforeSave: false })

        return {accessToken, refereshToken}

    } catch (error){
        throw new ApiError(500,"Smothing went wrong generate referesh token")
    }
}

const registerUser = asyncHandler(async (req, res, next) => { 
    // get user details from frontend
    // validation - not empty
    // check if user already exists: user name, email
    // check for image and avtar
    //upload image to cloudinary, avatar
    //create user object - create user in db
    // remove password and refresh token from user object
    // check usser creation
    // return response

    const {fullName, username, email, password} = req.body
    console.log("email", email);

    // if(fullName === "" || username === "" || email === "" || password === ""){
    //     throw new ApiError(400, "All fields are required")
    // }
    if ([fullName, username, email, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({$or: [{username}, {email}]});

    if(existingUser){
        throw new ApiError(409, "User already exists")
    }
    console.log("FILES:", req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath || !coverImageLocalPath) {
    throw new ApiError(400, "Avatar and cover image are required");
}


    const avatar =  await uploadToCloudinary(avatarLocalPath, "avatar")
    const coverImage = await uploadToCloudinary(coverImageLocalPath, "coverImage")

    if(!avatar){
        throw new ApiError(400, "Failed to upload images to cloudinary")
    }

   const createuser =  User.create({fullName, 
        username:username.toLowerCase(),
        email,
        password,
        avatar:avatar.url || "", 
        coverImage:coverImage?.url || ""
    })

    const createdUser = await User.findById(createuser._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "User creation failed")
    }

    return res.status(201).json(
        new ApiResponse(202, "User created successfully", createdUser)
    )



})

const loginUser = asyncHandler(async (req, res, next) => {
    // req body data
    //username or email
    // find the user
    // password check
    //acess or refres token 
    // send cookie 

    const {email,username,password} = req.body
    
    if(!username || !email){
        throw new ApiError(400, "username or email reqireed ")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, " user does not exist")
    }

    const isPasswordValid = await user.isPasswordCoorect(password)

    if(!isPasswordValid){
        throw new ApiError(401, " Incalid user password")
    }

    const {accessToken,refereshToken} = await generateAccessAndReferesTokens(user._id)

    const loggedinUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refereshToken", refereshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedinUser,accessToken,refereshToken

            },
            "User logged in sucessfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refereshToken: undefined
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200,{}, "User logged out")
    )
    

})

const refereshAccessToken = asyncHandler(async  (req, res) => {
    const incomingRefreshToken =  req.cookies.refereshToken || req.body.refereshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized access")
    }
    
    try{
        const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid refreshToken")
    }

    if(incomingRefreshToken!== user?.refereshToken){
        throw new ApiError(401, "refreshToken is expierd and use")
    }
    const options = {
        httpOnly : true,
        secure : true
    }

    const {accessToken, newrefereshToken} = await generateAccessAndReferesTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefereshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refereshToken: newrefereshToken},
            "Access Token refreshed"
        )
    )
    } catch(error) {
        throw new ApiError(401, "Invalid referesh token")
    }




})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCoorect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password change Successfully"
    ))
})

const getCurrentUser = asyncHandler(async(req, res) =>{
    return res.status(200,req.user, "current user fetchen successfully")

})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName ,email} = req.body

    if (!fullName || !email ){
        throw new ApiError(400, "All fields  are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user , "Account Details upadted success"))

});

const upadateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File is missing")

    }

    const avatar = await uploadToCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, " Erroe while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"avatar image upadte success")
    )

})

const upadateUserCoverImage = asyncHandler(async(req,res) => {
    const coverLocalPath = req.file?.path

    if(!coverLocalPath){
        throw new ApiError(400, "Cover File is missing")

    }

    const coverImage  = await uploadToCloudinary(coverLocalPath)

    if(!avatar.url){
        throw new ApiError(400, " Erroe while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"cover image upadte success")
    )

})

const getUserChannelProfile = asyncHandler(async(req, res) => {

    const {username} = req.params

    if(!username){
        throw new ApiError(400, "UserName is missing")
    }

    const channel  = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscr ibers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscribers",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount : {
                    $size : "$subscribers"
                },
                subscribesToCount : {
                    channelSubscribesToCount : {
                         $size: "$subscribedTo"
                    }
                },
                isSubscribed :  {
                     $cond : {
                        if: {$in : [req.user?._id, "$subscribers.subscribers"]},
                        than : true,
                        else : false
                     }
                }
            }
        },
        {
            $project : {
                fullName: 1,
                username : 1,
                subscribersCount:1,
                channelSubscribesToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
])

if(!channel?.length){
    throw new ApiError(404, " Channel dose not exist")
}

return res.status(200)
.json(
    new ApiResponse(200,
        channel[0],
        "User channle feched successfully"
    )
)
     
})

const getWatchHistory = asyncHandler(async(req,res) => {
    const user = await User.aggregate([
        {
            $match :{
                _id : new mongoose.Types.ObjectId(
                    req.user._id
                )
            },
            $lookup:{
                from : "Videos",
                localField:"watchHistory",
                foreignField:"_id",
                as : "watchHistory",
                pipeline: [
                    {
                        $lookup :{
                            from : "users",
                            localField: "owner",
                            foreignField: "_id",
                            as : "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                 $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }

    ])

    return res.status(200)
    .json(
        new ApiResponse(200,
            user[0].watchHistory,
            "Watch history feched successfully"
        )
    )

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refereshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    upadateUserAvatar,
    upadateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}