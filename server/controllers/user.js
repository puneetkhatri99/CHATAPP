import { compare } from "bcrypt";
import {User} from "../models/user.js"
import { sendToken , cookieOptions, emitEvent, uploadFilesOnCloudinary} from "../utils/features.js";
import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import { CONNECTED_TOKEN } from "../constants/config.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";



const newUser = TryCatch(async(req , res ,next) => {

    const {name , bio , username , password} = req.body

    const file = req.file; 


    if (!file) return next(new ErrorHandler("Please Upload Avatar"));

    const result = await uploadFilesOnCloudinary([file])

    const avatar = {
        public_id: result[0].public_id,
        url: result[0].url,
    }

    const user = await User.create({
        name,
        bio,
        username,
        password,
        avatar
    }) 

    sendToken(res ,user , "user created" , 201 )
})


const login = TryCatch(async (req , res , next) => {
    const {username , password} = req.body;

    const user = await User.findOne({username}).select("+password")

    if(!user) return next(new ErrorHandler ("invalid user" , 404))   

    const isMatch = await compare(password , user.password)

    if(!isMatch) return next(new ErrorHandler ("invalid password" , 404)) 

    sendToken(res , user , `welcome back ${user.name}` , 201)
});

const getMyProfile = TryCatch(async(req, res, next)  => {
   
    const user = await User.findById(req.user);
    if(!user) return next(new ErrorHandler("user not found" , 404))

    res.status(201).json({
        success: true,
        user,
    })

})

const logout = TryCatch(async(req, res)  => {
   
    return res.status(200).cookie(
        CONNECTED_TOKEN, "" , {...cookieOptions , maxAge:0}
    ).json({
        success: true,
        message: "Logged out successfully",
    })

})

const searchUser = TryCatch( async(req , res) => {
         
    const {name = ""} = req.query;

    if (!name.trim()) {
        return res.status(200).json({
          success: true,
          users: [],
        });
      }

    // finding all chats
    const myChats = await Chat.find({groupChat:false , members :req.user})

    //  extracting All Users from my chats means friends or people I have chatted with

    const allUsersFromMyChats = myChats.flatMap((chat) => chat.members)

    // Finding all users except me and my friends

    const allUsersExceptMeAndFriends = await User.find(
        {
            _id: { $nin: allUsersFromMyChats },
            name: { $regex: name, $options:"i" },
        }
    )

    const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
        _id,
        name , 
        avatar : avatar.url
    }))

   return res.status(200).json({
        success: true,
        users
    })
})

const sendFriendRequest = TryCatch( async(req , res , next) => {

    const {userId} = req.body;

    const request = await Request.findOne(
       {
         $or:[
            { sender: req.user, receiver: userId },
            { sender: userId, receiver: req.user },
         ]
    }
    )

    if(request) return next(new ErrorHandler("request already sent" , 400))

     await Request.create({
            sender: req.user,
            receiver: userId,
          });

    emitEvent(req , NEW_REQUEST , [userId])

    return res.status(200).json({
            success: true,
            message: "Friend Request Sent",
          });
})

const acceptFriendRequest = TryCatch(async (req , res , next) => {

    const {requestId , accept} = req.body;

    const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");

    if (!request) return next(new ErrorHandler("Request not found", 404));

    if (request.receiver._id.toString() !== req.user.toString())
      return next(
        new ErrorHandler("You are not authorized to accept this request", 401)
      );

      if(!accept){
        await request.deleteOne()

        return res.status(200).json({
            success: true,
            message: "Friend Request Rejected",
          });
      }

      const members = [request.sender._id ,request.receiver._id ]

      await Promise.all([
        Chat.create({
            members,
            name: `${request.sender.name}-${request.receiver.name}`,
        }),
        request.deleteOne()
      ])

      emitEvent(req , REFETCH_CHATS , members)


  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
  });
})

const getMyNotifications = TryCatch(async(req , res , next) => {

    const request = await Request.find({receiver : req.user}).populate(
        "sender" ,
        "name avatar"
    )

    const allRequests = request.map(({_id , sender}) => ({
            _id,
            sender:{
                _id: sender._id,
                name: sender.name,
                avatar: sender.avatar.url,
            }
    }))

    return res.status(200).json({
        success: true,
        allRequests,
      });
})

const getMyFriends = TryCatch(async(req , res , next) => {
    
    const chatId = req.query.chatId

    const chats = await Chat.find({
        members : req.user ,
        groupChat : false
    }).populate("members", "name avatar")

    const friends = chats.map(({members}) => {
        const otherUser = getOtherMember(members , req.user )

        return  {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar.url,
          };
    })

    if(chatId) {
        const chat = await Chat.findById(chatId)

        const availableFriends = friends.filter(
            (friend) => !chat.members.includes(friend._id)
        )

        return res.status(200).json({
            success: true,
            friends: availableFriends,
          });
    }else {
        return res.status(200).json({
          success: true,
          friends,
        });
      }
})

export {
    login ,
    logout,
    newUser,
    getMyProfile,
    searchUser,
    sendFriendRequest,
    acceptFriendRequest,
    getMyNotifications,
    getMyFriends

}

