//require("dotenv").config(path:"./.env");
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"])

dotenv.config({ path: "./.env" });
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((err) => {
    console.log("Error connecting to MongoDB", err);
    throw err;
})












/*
import express from "express";
const app = express();


( async () => {
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (err) => {
            console.log(err);
            throw err;
        })

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })

    }catch(err){
        console.log(err);
        throw err;
    }
    
})();
*/