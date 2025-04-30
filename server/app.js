import express from "express"
import { connectDB } from "./utils/features.js"
import { errorMiddleware } from "./middlewares/error.js"
import cookieParser from "cookie-parser"
import dotenv from 'dotenv'
import { Server } from "socket.io"
import {createServer} from "http"
import { v4 as uuid } from "uuid";
import { NEW_MESSAGE , NEW_MESSAGE_ALERT, START_TYPING , STOP_TYPING , CHAT_JOINED , CHAT_LEAVED , ONLINE_USERS} from "./constants/events.js"
import { Message } from "./models/message.js"
import { getSockets } from "./lib/helper.js"
import cors from "cors";
import { corsOptions } from "./constants/config.js"
import { v2 as cloudinary } from "cloudinary";
import { socketAuthenticator  } from "./middlewares/auth.js"
import userRoutes from "./routes/user.js"
import chatRoute from "./routes/chat.js"
import adminRoute from "./routes/admin.js"


dotenv.config(
    {
        path: "./.env"
    }
)

const MONGO_uri = process.env.MONGO_URI
const port = process.env.PORT || 3000
const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsasdsdfsdfsdfd";
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
const userSocketIDs = new Map()
const onlineUsers = new Set();

connectDB(MONGO_uri)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

const app = express()
const server = createServer(app)
const io = new Server(server , {
    cors: corsOptions
} )

app.set("io", io);

app.use(express.json())
app.use(cookieParser());
app.use(cors(corsOptions))

app.use("/api/v1/user" , userRoutes)
app.use("/api/v1/chat" , chatRoute)
app.use("/api/v1/admin" , adminRoute)


io.use((socket, next) => {

    cookieParser()(
        socket.request,
        socket.request.res,
        async (err) => await socketAuthenticator(err, socket, next)
    )
  });


io.on("connection", (socket) => {
    const user = socket.user
    console.log(user.name + " connected")
    userSocketIDs.set(user._id.toString() , socket.id) 
  

    socket.on(NEW_MESSAGE , async({chatId , message , members})=>{

            const messageForRealTime ={
                content : message,
                _id : uuid(),
                sender:{
                    _id:user._id,
                    name:user.name
                },
                chat: chatId,
                createdAt: new Date().toISOString(),
            }

            const messageForDB = {
                content: message,
                sender: user._id,
                chat: chatId,
              };

        const membersSocket = getSockets(members);

        io.to(membersSocket).emit(NEW_MESSAGE , {
            chatId,
            message: messageForRealTime
        })

        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

        try {
            await Message.create(messageForDB)
        } catch (error) {
            throw new Error(error)
        }

    })

    socket.on(START_TYPING , ({members , chatId}) => {
        const membersSockets = getSockets(members);
        socket.to(membersSockets).emit(START_TYPING, { chatId });
    })

    socket.on(STOP_TYPING, ({ members, chatId }) => {
        const membersSockets = getSockets(members);
        socket.to(membersSockets).emit(STOP_TYPING, { chatId });
      });

      socket.on(CHAT_JOINED, ({ userId, members }) => {
        onlineUsers.add(userId.toString());
    
        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
      });
    
      socket.on(CHAT_LEAVED, ({ userId, members }) => {
        onlineUsers.delete(userId.toString());
    
        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
      });

    socket.on("disconnect" , (reason, details) =>{
       console.log(reason);
        userSocketIDs.delete(user._id.toString());
        onlineUsers.delete(user._id.toString());
        socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
        console.log(user.username + " disconnected")
    })
})

app.use(errorMiddleware)

server.listen(port , ()=>{
    console.log(`server is running on port ${port} in ${envMode} Mode`)
})

export {
    adminSecretKey,
    envMode,
    userSocketIDs
}