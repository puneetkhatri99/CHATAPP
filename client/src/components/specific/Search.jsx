import { useInputValidation } from '6pp';
import { Search as SearchIcon } from "@mui/icons-material";
import { Dialog, DialogTitle, InputAdornment, List, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncMutation } from '../../hooks/hooks';
import { useLazySerarchUserQuery, useSendFriendRequestMutation } from '../../redux/api/api';
import { setIsSearch } from '../../redux/reducers/misc';
import UserItem from '../shared/UserItem';


export default function Search() {

  const {isSearch} = useSelector((state)=> state.misc)

  const [searchUser] = useLazySerarchUserQuery()
  
  const [sendFriendRequest ,isLoadingSendFriendRequest ] = useAsyncMutation (useSendFriendRequestMutation)

  const dispatch = useDispatch()

 const search = useInputValidation("")

  const addFriendHandler = async(id) => {
      await sendFriendRequest("Sending friend request...", {userId:id})
  }

  const [users, setUsers] = useState([])

  const searchCloseHandler = () => {
    dispatch(setIsSearch(false))
  }

  useEffect(()=>{
    const timeOutId = setTimeout(() => {
      searchUser(search.value)
        .then(({ data }) => setUsers(data.users))
        .catch((e) => console.log(e));
    }, 1000);

    return () => {
      clearTimeout(timeOutId);
    };
  } , [search.value])

  return (
    <Dialog open={isSearch} onClose={searchCloseHandler} >
     <Stack p={2} direction={"column"} width={"25rem"}> 
      <DialogTitle textAlign={"center"}>Find people</DialogTitle>
      <TextField label=""
          value={search.value}
          onChange={search.changeHandler}
          variant="outlined"
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}/>
      </Stack>

      <List>
        {users.map((user) => (
          <UserItem key={user._id} user={user} handler={addFriendHandler} handlerIsLoading={isLoadingSendFriendRequest} />
        ))}
      </List>
    </Dialog>
  )
}
