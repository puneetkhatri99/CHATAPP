import { Button, Dialog, DialogTitle, Skeleton, Stack, TextField, Typography } from '@mui/material'
import UserItem from '../shared/UserItem'
import { useInputValidation } from '6pp'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAvailableFriendsQuery  , useNewGroupMutation} from '../../redux/api/api'
import { useErrors , useAsyncMutation } from '../../hooks/hooks'
import { setIsNewGroup } from '../../redux/reducers/misc'
import toast from 'react-hot-toast'


const NewGroup = () => {

  const dispatch = useDispatch()
  const {isNewGroup} = useSelector((state) => state.misc)
  const {isError , error , isLoading , data} = useAvailableFriendsQuery()
  const [newGroup , isLoadingNewGroup] = useAsyncMutation(useNewGroupMutation)
    const GroupName = useInputValidation("")
    const [selectedMembers , setSelectedMembers] = useState([])

    const errors = [{isError , error}]
    useErrors(errors)

    const selectMemberHandler = (_id) => {
            setSelectedMembers((prev) => (prev.includes(_id) ? prev.filter((id) => id !== _id) : [...prev , _id]))
    }

    const SubmitHandler = () => {
      if(!GroupName.value) return toast.error("Group name is required")

      if(selectedMembers.length < 2) return toast.error("select at least 2 members")

        newGroup ("creating new group..." , {
          name : GroupName.value,
          members : selectedMembers
        })

        dispatch(setIsNewGroup(false))
    }
    const closeHandler = () => {
      dispatch(setIsNewGroup(false))
    }
  return (
    <Dialog open={isNewGroup} onClose={closeHandler}> 
        <Stack  p={{ xs: "1rem", sm: "3rem" }} width={"25rem"} spacing={"1rem"}> 
        <DialogTitle textAlign={"center"} variant="h4">New Group</DialogTitle>

        <TextField
         label="Group Name"
         value = {GroupName.value}
         onChange={GroupName.changeHandler}/>

        <Typography variant="body1">
            Members
        </Typography>

        <Stack>
             { isLoading ? (<Skeleton/>) : (data?.friends?.map((user) => (
                      <UserItem key={user._id} 
                      user={user}
                       handler={selectMemberHandler}
                       isAdded={selectedMembers.includes(user._id)} />
                    )))}
        </Stack>
        
        <Stack direction={"row"} justifyContent={"space-evenly"}>
            <Button
             variant="outlined"
            color="error"
            size="large" 
            onClick={closeHandler}>Cancel</Button>
        <Button 
         variant="contained"
         size="large"
         onClick={SubmitHandler} >Create</Button>
        </Stack>    
        </Stack>
    </Dialog>
  )
}

export default NewGroup