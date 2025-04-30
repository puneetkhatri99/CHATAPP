import { Box, Typography } from "@mui/material"
import { Link } from "../styles/StyledComponent"
import Stack from '@mui/material/Stack'
import { memo } from "react"
import AvatarCard from "./AvatarCard"
import {motion} from "framer-motion"


const ChatItem = ({
    avatar = [],
    name,
    _id,
    groupChat = false,
    sameSender,
    isOnline,
    newMessageAlert,
    index = 0,
    handleDeleteChat,
  }) => {
  return (

        <Link to={`/chat/${_id}`} 
            sx={{
                padding: "0",
            }}
            onContextMenu={(e) => handleDeleteChat(e, _id , groupChat)}>

        <motion.div 
        initial={{ opacity: 0, y: "-100%" }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * index }}
        style={{display: "flex",
                gap: "1rem",
                alignItems: "center",
                backgroundColor: sameSender ? "black" : "unset",
                color: sameSender ? "white" : "unset",
                position: "relative",
                padding: "1rem",
                paddingRight:"1rem"

                }}>
                
            
            <AvatarCard avatar={avatar} />
       
                <Stack>
                <Typography>{name}</Typography>
                {
                    newMessageAlert && (
                        <Typography>{newMessageAlert.count} New Messsages</Typography>
                    )
                }
                </Stack>
                    
            {isOnline && <Box sx={{ width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "green",
              position: "absolute",
              top: "50%",
              right: "1rem",
              transform: "translateY(-50%)"}}/>}
 </motion.div>
        </Link>
    )
  }
export default memo(ChatItem)