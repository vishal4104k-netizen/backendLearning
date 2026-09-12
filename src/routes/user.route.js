// 
import { Router } from "express";

import {
    loginUser,
    logoutUser,
    registerUser,
    refereshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    upadateUserAvatar,
    upadateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middelware.js";


const router = Router();


// Register
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);


// Login
router.route("/login").post(
    loginUser
);


// Logout
router.route("/logout").post(
    verifyJWT,
    logoutUser
);


// Refresh Access Token
router.route("/referesh-token").post(
    refereshAccessToken
);

router.route("/change-Password").post(
    verifyJWT, changeCurrentPassword
);
router.route("current-user").get(verifyJWT, getCurrentUser);

router.route("/upadate-account").patch(verifyJWT, updateAccountDetails);

router.route("/avatar").patch(verifyJWT, upload.single("avatar"),
upadateUserAvatar);

router.route("/cover-image").patch(verifyJWT, upload.single("/coverImage"),
upadateUserCoverImage
);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);


router.route("/history").get(verifyJWT, getWatchHistory);



export default router;