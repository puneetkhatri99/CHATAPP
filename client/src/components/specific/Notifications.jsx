import { Dialog, Stack ,DialogTitle, Typography, Skeleton} from '@mui/material'
import React, { useEffect } from 'react'
import { sampleNotifications } from '../../constants/sampledata'
import NotificationItem from '../shared/NotificationItem'
import { useAcceptFriendRequestMutation, useGetNotificationsQuery } from '../../redux/api/api'
import { useAsyncMutation, useErrors } from '../../hooks/hooks'
import { useDispatch, useSelector } from 'react-redux'
import { setIsNotification } from '../../redux/reducers/misc'

const Notifications = () => {

  const {isNotification} = useSelector((state) => state.misc)

  const dispatch = useDispatch()

  const {isLoading , data , isError , error} = useGetNotificationsQuery()

  const [acceptRequest] = useAsyncMutation(useAcceptFriendRequestMutation)

  useErrors([{isError , error}]);



  const closeHandler = () => {
    dispatch(setIsNotification(false))
  }

    const FriendRequestHandler = async({_id , accept}) => {
      await acceptRequest("Accepting...", { requestId: _id, accept });
      dispatch(setIsNotification(false))
    }
  return (
    <Dialog open = {isNotification} onClose={closeHandler}>
        <Stack  p={{ xs: "1rem", sm: "2rem" }} maxWidth={"25rem"}> 
        <DialogTitle>NOTIFICATIONS</DialogTitle>

        { isLoading ? (
          <Skeleton/>
        ) :
            (data?.allRequests.length > 0 ? (
                data?.allRequests?.map(({sender , _id}) => (
                <NotificationItem _id={_id} sender = {sender} handler={FriendRequestHandler} key={_id}/>))
            ) : <Typography variant="body1" textAlign={"center"} >No Notifications</Typography> )
        }
        </Stack>
    </Dialog>
  )
}

export default Notifications