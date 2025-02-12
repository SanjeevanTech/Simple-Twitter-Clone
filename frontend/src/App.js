import { Routes,Route, Navigate } from 'react-router-dom';
import {Toaster } from "react-hot-toast"
import { useQuery } from '@tanstack/react-query';


import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import Sidebar from './components/common/SideBar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from "./pages/notification/NotificationPage.js";
import ProfilePage from "../src/pages/profile/ProfilePage.js"
import NotFoundPage from './pages/NotFoundPage.js';
import { baseUrl } from "../src/constant/url.js";
import LoadingSpinner from './components/common/LoadingSpinner.js';



const App=()=>{
  const {data:authuser,isLoading}=useQuery({
    queryKey:["authuser"],
    queryFn:async()=>{
      try{
        const res=await fetch(`${baseUrl}/api/auth/me`,{
          method :"GET",
					credentials:"include",
					headers :{
						"Content-Type":"application/json",
					}
        })
        const data=await res.json();

        if(data.error){
          return null;
        }
				if(!res.ok){
					throw new Error(data.error || "Something went wrong")
				}
        
        return data;

      }catch(error){
        throw error;
      }
    },
    retry :false
  })
  
 



  if(isLoading){
    return (
      <div className='flex justify-center item-center h-screen'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }
  return (
    <div className='flex max-w-6x1 mx-auto'>
      {authuser && < Sidebar />}
      <Routes>
        <Route path="/" element={authuser ? <HomePage/> : <Navigate to="/login"/>}/>
        <Route path="/login" element={!authuser ? <LoginPage/> : <Navigate to="/"/>}/>
        <Route path="/signup" element={!authuser ?<SignUpPage/> : <Navigate to="/"/>}/>
        <Route path="/notification" element={authuser ?<NotificationPage/> : <Navigate to="/login"/>}/>
        <Route path="/profile/:username" element={authuser ?<ProfilePage/> : <Navigate to="/login"/>}/>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {authuser && <RightPanel />}
      <Toaster />
      

    </div>
  )
}

export default App;
