// 
import { Router } from "express";

import {
    loginUser,
    logoutUser,
    registerUser,
    refereshAccessToken
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


export default router;