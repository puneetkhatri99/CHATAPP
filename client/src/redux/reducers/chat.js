import { createSlice } from "@reduxjs/toolkit";
import { getOrSaveFromLocalStorge } from "../../lib/features";
import { NEW_MESSAGE_ALERT } from "../../constants/events";

const initialState = {
    notificationCount: 0,
    newMessagesAlert : getOrSaveFromLocalStorge({
      key: NEW_MESSAGE_ALERT,
      get: true,
    }) || [{
      chatId : "",
      count : 0
    }]
}

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers:{
        incrementNotification: (state) => {
            state.notificationCount += 1;
          },
          resetNotificationCount: (state) => {
            state.notificationCount = 0;
          },

          setNewMessageAlert : (state , action) => {
            const chatId = action.payload.chatId;

            const index = state.newMessagesAlert.findIndex((item) => item.chatId === chatId); 
            if(index !== -1){
                state.newMessagesAlert[index].count += 1; 
          }else{
                state.newMessagesAlert.push({chatId , count : 1})
            }
          },
          
          removeNewMessagesAlert : (state , action) => {
            state.newMessagesAlert = state.newMessagesAlert.filter((item) => item.chatId !== action.payload);  
          }
          },
    }
)

export default chatSlice;
export const { incrementNotification, resetNotificationCount , setNewMessageAlert , removeNewMessagesAlert } = chatSlice.actions;