import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import { v4 as uuid } from "uuid";
import {v2 as cloudinary} from "cloudinary"
import { getBase64, getSockets } from "../lib/helper.js";

const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "none",
    httpOnly: true,
    secure: true,
  };
  

const connectDB = (uri) => {
mongoose.connect(uri , {dbName: "CONNECTED"}).then(
    (data)  => {
        console.log(`connected to database ${data.connection.host}`)
    }
).catch((err) => {
    throw err
})
}

const sendToken = (res , user , message , status) => {
    
   const token = jwt.sign({_id:user._id} , process.env.JWT_SECRET)

    return res.status(
        status).cookie(
        "connected_token", token , cookieOptions ).json(
        {
            success:true,
            user,
            message
        }
    )
}

const emitEvent = (req, event, users, data) => {
   const io = req.app.get("io")
   const usersSockets = getSockets(users)
   io.to(usersSockets).emit(event , data)

}

const uploadFilesOnCloudinary = async (files = []) => {
    const fileArray = Array.isArray(files) ? files : [files];

  const uploadPromises = fileArray.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(getBase64(file), {
        resource_type: "auto",
        public_id: uuid(),
      })
        .then(resolve)
        .catch(reject);
    });
  });

    try {
        const results = await Promise.all(uploadPromises);

         // Ensure Cloudinary returned valid results
    if (!results || !Array.isArray(results)) {
      throw new Error("Invalid response from Cloudinary");
    }
        const formattedResults = results.map((result) => ({
            public_id: result.public_id,
            url: result.secure_url,
          }));
          return formattedResults;
    } catch (error) {
        console.error("Cloudinary Upload Failed:", error);
        throw new Error(`Error uploading files: ${error.message}`);
    }
  };

const deletFilesFromCloudinary = async (public_ids) => {
    // Delete files from cloudinary
  };
  

export {
    connectDB,
    sendToken,
    cookieOptions,
    emitEvent ,
    uploadFilesOnCloudinary,
    deletFilesFromCloudinary
}