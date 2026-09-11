// import {v2 as cloudinary} from "cloudinary";
// import fs from "fs";    
// cloudinary.config({ 
//   cloud_name: Process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: Process.env.CLOUDINARY_API_KEY, 
//   api_secret: Process.env.CLOUDINARY_API_SECRET,
// });

// const uploadToCloudinary = async (localFilePath) => {
//     try {
//         if(!localFilePath) return null;
//         const response = await cloudinary.uploader.upload(localFilePath,
//             {
//                 resource_type: "auto",
//             }
//         )// file has been uploaded to cloudinary
//         console.log("File uploaded to Cloudinary successfully", response.url);
//         fs.unlinkSync(localFilePath); // remove the file from local uploads folder
//         return response.url;

//     }
//     catch (error) {
//         fs.unlinkSync(localFilePath); // remove the file from local uploads folder operation failed
//     }
// }

// const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });

// export {uploadToCloudinary}

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log("File uploaded successfully:", response.url);

        return response;
    } catch (error) {
        console.log("Cloudinary upload error:", error);
        return null;
    }
};

export { uploadToCloudinary };