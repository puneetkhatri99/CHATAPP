import React , {useState} from 'react'
import { useFileHandler, useInputValidation } from "6pp";
import {Container ,Avatar,  IconButton, Paper ,Stack, Typography , TextField, Button} from '@mui/material'
import { CameraAlt as CameraAltIcon } from "@mui/icons-material";
import {VisuallyHiddenInput} from '../components/styles/StyledComponent.jsx' 
import {usernameValidator} from '../utils/validators.js' 
import {bgcolour} from '../constants/colors.js'
import {useDispatch } from 'react-redux'
import axios from "axios"
import { server } from '../constants/config'
import toast from "react-hot-toast";
import {userExists} from "../redux/reducers/auth.js"


function Login() {

  const [isLogin , setIsLogin] = useState(true) ;
  const [isLoading, setIsLoading] = useState(false);
  const toggleLogin = () => setIsLogin(prev => !prev);

  const name = useInputValidation("");
  const bio = useInputValidation("");
  const username = useInputValidation("" ,usernameValidator);
  const password = useInputValidation("");

  const avatar = useFileHandler("single" , 100);

  const dispatch = useDispatch()


  const handleLogin = async(e) => {
    e.preventDefault();
    const toastId = toast.loading("Logging In...");

    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      }}

      try {
        const {data} = await axios.post(
          `${server}/api/v1/user/login`,
          {
            username: username.value,
            password: password.value,
          },
          config
        );
        dispatch(userExists(data.user));
        toast.success(data.message, {
          id: toastId,
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Something Went Wrong", {
          id: toastId,
        });
      }finally {
        setIsLoading(false);
      }
    }

  const handleSignUp = async(e) => {
    e.preventDefault();

    const toastId = toast.loading("Signing Up...")

    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const formData = new FormData()

    formData.append("avatar", avatar.file);
    formData.append("name", name.value);
    formData.append("bio", bio.value);
    formData.append("username", username.value);
    formData.append("password", password.value);

    try {
      const {data} = await axios.post(
        `${server}/api/v1/user/newuser`,
        formData,
        config
      )
      console.log(data);
      dispatch(userExists(data.user));
      toast.success(data.message, {
        id: toastId,
      });
    
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something Went Wrong", {
        id: toastId,
      });
    }finally{
      setIsLoading(false);
    }

    };


  return( <div style={ {backgroundImage : bgcolour}}>
    <Container maxWidth="xs" component={"main"} sx={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>   
    <Paper elevation={3} 
    sx={{
        padding: 4, display: "flex",flexDirection: "column",alignItems: "center"
      }}> 

      { isLogin ? (<>
          <Typography variant="h4" sx={{mb:2}}>Login</Typography>
            <form style={{width: "100%" , marginTop:1}} onSubmit={handleLogin}> 
                <TextField
                required
                fullWidth
                margin='normal'
                label="username"
                variant="outlined"
                value={username.value}
                onChange={username.changeHandler}>
            
                </TextField>
                <TextField
                required
                fullWidth
                margin='normal'
                label="password"
                type='password'
                variant="outlined"
                value={password.value}
                onChange={password.changeHandler}
                ></TextField>


                <Button sx={{marginTop: 2}} variant="contained" color="primary" fullWidth   disabled={isLoading}   type="submit">
                    Login
                </Button>

                <Typography textAlign={'center'} m={"1rem"}>OR</Typography>

                <Button
                variant="text" 
                fullWidth
                onClick={toggleLogin} 
                disabled={isLoading}>
                    Sign Up Insted
                </Button>
            </form>
        </>) : (<>
            <Typography variant="h4" sx={{mb:2}}>Sign Up</Typography>
            <Stack position={"relative"} width={"10rem"} margin={"auto"}>
                  <Avatar
                    sx={{
                      width: "10rem",
                      height: "10rem",
                      objectFit: "contain",
                    }}
                    src= {avatar.preview}
                  />

                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      color: "white",
                      bgcolor: "rgba(0,0,0,0.5)",
                      ":hover": {
                        bgcolor: "rgba(0,0,0,0.7)",
                      },
                    }}
                    component="label"
                  >
                    <>
                      <CameraAltIcon />
                      <VisuallyHiddenInput
                        type="file"
                        onChange={avatar.changeHandler}
                      />
                    </>
                  </IconButton>
                </Stack>
                {avatar.error && (
                  <Typography
                    m={"1rem auto"}
                    width={"fit-content"}
                    display={"block"}
                    color="error"
                    variant="caption"
                  >
                    {avatar.error}
                  </Typography>
                )} 

              <form style={{width: "100%" , marginTop:1}} onSubmit={handleSignUp}> 
                  <TextField
                   required
                  fullWidth
                  margin='normal'
                  label="name"
                  variant="outlined"
                  value={name.value}
                  onChange={name.changeHandler} />

                  <TextField
                  required
                  fullWidth
                   margin='normal'
                  label="bio"
                  variant="outlined"
                  value={bio.value}
                  onChange={bio.changeHandler}/>

                  <TextField
                  required
                  fullWidth
                  label="username"
                   margin='normal'
                  variant="outlined"
                  value={username.value}
                  onChange={username.changeHandler}/>

                  {
                    username.error && <Typography color="error" variant='caption'>{username.error}</Typography>
                  }

                  <TextField
                  required
                  fullWidth
                   margin='normal'
                  label="password"
                  type='password'
                  variant="outlined"
                  value={password.value}
                  onChange={password.changeHandler} />
  
  
                  <Button sx={{marginTop: 2}} variant="contained" color="primary" type='submit' fullWidth   disabled={isLoading}>
                      Sign Up
                  </Button>
  
                  <Typography textAlign={'center'} m={"1rem"}>OR</Typography>
  
                  <Button
                  variant="text" 
                  fullWidth
                  onClick={toggleLogin}
                  disabled={isLoading}>
                    Login Insted
                  </Button>
              </form>
          </>)}
     </Paper>
         </Container>
         </div>);

                }
export default Login