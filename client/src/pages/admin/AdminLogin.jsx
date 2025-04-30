
import React , {useEffect} from 'react'
import {  useInputValidation } from "6pp";
import {Container ,Avatar,  IconButton, Paper ,Stack, Typography , TextField, Button} from '@mui/material'
import {bgcolour} from '../../constants/colors.js'
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin, getAdmin } from "../../redux/thunk/admin";


const AdminLogin = () => {

const { isAdmin } = useSelector((state) => state.auth);
const dispatch = useDispatch();

const secretKey = useInputValidation("");


const handleLogin = (e) => {
  e.preventDefault();
  dispatch(adminLogin(secretKey.value));
}

useEffect(() => {
  dispatch(getAdmin());
}, [dispatch]);

if (isAdmin) return <Navigate to="/admin/dashboard" />;


if(isAdmin) return <Navigate to="/admin/dashboard"/>
  return (
    <div style={ {backgroundImage : bgcolour}}>
    <Container maxWidth="xs" component={"main"} sx={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>   
    <Paper elevation={3} 
    sx={{
        padding: 4, display: "flex",flexDirection: "column",alignItems: "center"
      }}> 

          <Typography variant="h4" sx={{mb:2}}>Admin Login</Typography>
            <form style={{width: "100%" , marginTop:1}} onSubmit={handleLogin}> 
                <TextField
                required
                fullWidth
                margin='normal'
                label="SECRET KEY"
                type='password'
                variant="outlined"
                value={secretKey.value}
                onChange={secretKey.changeHandler}
                ></TextField>


                <Button sx={{marginTop: 2}} variant="contained" color="primary" fullWidth  type="submit">
                    Login
                </Button>
            </form>
     </Paper>
         </Container>
         </div>
  )
}

export default AdminLogin