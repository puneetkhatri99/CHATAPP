import React, { memo } from 'react'
import { Avatar, Button, ListItem, Stack, Typography } from '@mui/material'
import { transformImage } from '../../lib/features'
const NotificationItem = ({sender , _id , handler}) => {
 
    const {name , avatar} = sender
    return (
        <ListItem>
         <Stack direction={"row"} alignItems={"center"} spacing={"1rem"} width={"100%"} >
     
             <Avatar src={transformImage(avatar)}/>
     
             <Typography
              variant="body1"
              sx={{
                flexGlow: 1,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}>
                 {`${name} send you a friend request`}
             </Typography>
             <Stack  
             direction={{
             xs: "column",
                 }}>
                <Button onClick={()=>{handler({_id , accept:true})}}>Accept</Button>
                <Button color="error"  onClick={()=>{handler({_id , accept:false})}}>Reject</Button>

             </Stack>
         </Stack>
         </ListItem>
       )
}

 export default memo(NotificationItem)