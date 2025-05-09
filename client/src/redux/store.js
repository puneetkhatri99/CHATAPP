import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./reducers/auth";
import chatslice from "./reducers/chat";
import miscSlice from "./reducers/misc";
import api from './api/api'

const store = configureStore(
    {
        reducer:{
            [authSlice.name] : authSlice.reducer,
            [miscSlice.name] : miscSlice.reducer,
            [chatslice.name] : chatslice.reducer,
            [api.reducerPath] : api.reducer
            
        },
        middleware:(defaultMiddleware) => [...defaultMiddleware() , api.middleware]
    }
)

export default store;