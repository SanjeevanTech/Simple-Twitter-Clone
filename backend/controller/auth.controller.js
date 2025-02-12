import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import generateToken from "../utils/generateToken.js";


export const signup=async(req,res)=>{
    try{
        const {username,fullname,email,password}=req.body;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if(!emailRegex.test(email)){
            return res.status(404).json({error : "Invalid Email Format"})
        }

        const existingEmail = await User.findOne({email});
        const existingUsername = await User.findOne({username});

        if(existingEmail || existingUsername){
            return res.status(404).json({error : "Already exit Email or Username"});
        }

        if(password.length < 6){
            return res.status(404).json({error : "Password must have 6 letters "});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser = new User({
            username,
            fullname,
            email,
            password : hashedPassword
        })
        
        if(newUser){
            generateToken(newUser._id,res)
            await newUser.save();
            res.status(200).json({
                _id : newUser.username,
                username :newUser.username, 
                fullname :newUser.fullname,
                email :newUser.email,
                followers :newUser.followers,
                following :newUser.following,
                profileImage :newUser.profileImage,
                coverImage :newUser.coverImage,
                bio :newUser.bio,
                link :newUser.link
            });
        }
        else{
            res.status(404).json({error : "Invalid user data"})
        }
          
          

    }catch(error){
        console.error(`Error in signup controller: ${error.message}`);
        res.status(500).json({error : "Internal server error"})
    }
}

export const login=async(req,res)=>{
    try{
        const {username,password}=req.body;
        const user=await User.findOne({username});
        const isPasswordCorrect=await bcrypt.compare(password,user?.password || "");

        if(!user || !isPasswordCorrect){
            return res.status(404).json({error : "Invalid Username or password"})
        }

        generateToken(user._id,res);

        res.status(200).json({
            _id : user.username,
            username :user.username, 
            fullname :user.fullname,
            email :user.email,
            followers :user.followers,
            following :user.following,
            profileImage :user.profileImage,
            coverImage :user.coverImage,
            bio :user.bio,
            link :user.link
        })
    }catch (error){
        console.log(`error in login controller ${error}`);
        console.error(`Error in signup controller: ${error}`);
        res.status(500).json({error : "Internal server error"});
    }
}

export const logout=async(req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message : "Logout Successfully"});
    }catch(error){
        console.log({error : "logout controller error"})
        console.log(`Error in signup controller: ${error}`)
        res.status(500).json({error : "Internal server Error"});
    }
}

export const getme=async(req,res)=>{
    try{
        const user=await User.findOne({_id : req.user._id}).select("-password")
        res.status(200).json(user);

    }catch(error){
        console.log({Error : `Error in getme Controller ${error}`})
        res.status(500).json({Error : "Internal server Error"});
    }
}

