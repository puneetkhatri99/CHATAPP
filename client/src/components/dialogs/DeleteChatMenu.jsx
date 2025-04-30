import { Menu, Stack , Typography } from '@mui/material'
import React, { useEffect } from 'react'
import {
    Delete as DeleteIcon,
    ExitToApp as ExitToAppIcon,
  } from "@mui/icons-material";
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setIsDeleteMenu } from '../../redux/reducers/misc';
import { useAsyncMutation } from '../../hooks/hooks';
import { useDeleteChatMutation, useLeaveGroupMutation } from '../../redux/api/api';

const DeleteChatMenu = ({dispatch , deleteMenuAnchor}) => {

    const navigate = useNavigate()
    const {isDeleteMenu , selectedDeleteChat} = useSelector((state)=>state.misc)

    const [deleteChat ,__, deleteChatData] = useAsyncMutation(useDeleteChatMutation)
    const [leaveGroup ,_, leaveGroupData] = useAsyncMutation(useLeaveGroupMutation)

    const isGroup = selectedDeleteChat.groupChat

    const closeHandler = () => {
        dispatch(setIsDeleteMenu(false))
    }

    const leaveGroupHandler = () => {
        closeHandler()
        leaveGroup("Leaving Group...", selectedDeleteChat.chatId);
    }

    const deleteChatHandler = () => {
        closeHandler();
        deleteChat("Deleting Chat...", selectedDeleteChat.chatId);
    }

    useEffect(() => {
        if (deleteChatData || leaveGroupData) navigate("/");
    } , [deleteChatData, leaveGroupData]);

  return (
   <Menu
    open={isDeleteMenu}  
   onClose={closeHandler} 
   anchorEl={deleteMenuAnchor.current}
   anchorOrigin={{
    vertical: "bottom",
    horizontal: "right",
  }}
  transformOrigin={{
    vertical: "center",
    horizontal: "center",
  }} >

<Stack
sx={{
    width: "10rem",
    padding: "0.5rem",
    cursor: "pointer",
  }}
  direction={"row"}
  alignItems={"center"}
  spacing={"0.5rem"}
   onClick={isGroup ? leaveGroupHandler : deleteChatHandler}>

{isGroup ? (
          <>
            <ExitToAppIcon />
            <Typography>Leave Group</Typography>
          </>
        ) : (
          <>
            <DeleteIcon />
            <Typography>Delete Chat</Typography>
          </>
        )}
</Stack>
   </Menu>
  )
}

export default DeleteChatMenu