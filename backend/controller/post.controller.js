import User from "../models/user.model.js";
import cloudinary from "cloudinary"
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"

export const createPost=async(req,res)=>{
    try{
        const {text}=req.body;
        let {img}=req.body;
        const userId=req.user._id.toString();

        const user=await User.findById({_id:userId})

        if(!user){
            return res.status(404).json({error :"User not Found"})
        }

        if(!text && !img){
            return res.status(404).json({error:"Post must have text or Img"})
        }

        if(img){
            const uploadResponse=await cloudinary.uploader.upload(img);
            img=uploadResponse.secure_url;
        }

        const newPost=new Post({
            user:userId,
            text,
            img
        })

        await newPost.save();
        res.status(200).json(newPost)

    }catch(error){
        console.log(`Error in post controller ${error}`)
        res.status(500).json({error : "Internal server error"})
    }
}

export const deletePost=async(req,res)=>{
    try{
        const {id}=req.params;

        const post=await Post.findById({_id:id});
        if(!post){
            return res.status(404).json({error: "Post not found"})
        }

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error:"You are not authorized to delete this post"})
        }

        if(post.img){
            const imgId=post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete({_id:id});
        res.status(200).json({message : "Post deleted successfully"});

    }catch(error){
        console.log(`Error in Delete controller ${error}`)
        res.status(500).json({error : "Internal server error"})
    }
}

export const createComment=async(req,res)=>{
    try {
        const {text}=req.body;
        const postId=req.params.id;
        const userId =req.user._id;

        if(!text){
            return res.status(404).json({error : "Comment text is required"})
        }
    
        const post=await Post.findById({_id:postId});
        if(!post){
            return res.status(404).json({error : "Post not found"})
        }

        const comment={
            user : userId,
            text 
        }

        post.comments.push(comment);
        await post.save();
        res.status(200).json(post);

    }catch(error){
        console.log(`Error in comment post controller ${error}`)
        res.status(500).json({error :"Internal server error"})
    }
}

export const likeUnlikePost=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {id:postId}=req.params;

        const post=await Post.findById({_id:postId})
        if(!post){
            return res.status(404).json({error : "Post not found"})
        }

        const userLikePost=post.likes.includes(userId)
        if(userLikePost){
            //unlike
            await Post.updateOne({_id:postId},{$pull :{likes : userId}})
            await User.updateOne({_id:userId},{$pull : {likedPosts:postId}})
            
            const updatedLikes=post.likes.filter((id)=>isFinite.toString()!==userId.toString())

            
            res.status(200).json(updatedLikes);
        }
        else{
            //like
            post.likes.push(userId);
            await User.updateOne({_id:userId},{$push :{likedPosts:postId}})
            await post.save();

            const notification=new Notification({
                from:userId,
                to:post.user,
                type : "like"
            })
            await notification.save();
            const updatedLikes=post.likes;
            
            res.status(200).json(updatedLikes)
        }



    }catch (error){
        console.log(`Error in Like post_controller ${error}`)
        res.status(500).json({error :"Internal server error"})
    }
}

export const getAllPosts=async(req,res)=>{
    try{
        const post=await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select : "-password"
        })

        .populate({
            path:"comments.user",
            select : ["-password","-email"]
        })
        if(post.length === 0){
            return res.status(200).json([])
        }
        res.status(200).json(post);
    }catch(error){
        console.log(`Error in Like All post_controller ${error}`)
        res.status(500).json({error :"Internal server error"})
    }
}

export const getLikedPosts=async(req,res)=>{
    try{
        const userId=req.params.id;
        const user=await User.findById({_id:userId})
        if(!user){
            return res.status(404).json({error : "User not Found"})
        }
        const likedPosts=await Post.find({_id :{$in : user.likedPosts}})
        .populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select : ["-password","-email"]
        })
        res.status(200).json(likedPosts);
    }catch(error){
        console.log(`Error in get liked post_controller ${error}`)
        res.status(500).json({error :"Internal server error"})
    }
}

export const getFollowingPost=async(req,res)=>{
    try{
        const userId=req.user._id;
        const user=await User.findById({_id:userId})
        if(!user){
            return res.status(404).json({Error : "User not found"})
        }

        const following =user.following;
        const feedPosts=await Post.find({user :{$in : following}})
                        .sort({createdAt :-1})
                        .populate({
                            path:"user",
                            select:"-password"
                        })
                        .populate({
                            path:"comments.user",
                            select:"-password"
                        })
        res.status(200).json(feedPosts);


    }catch(error){
        console.log(`Error in get liked post_controller ${error}`)
        res.status(500).json({error :"Internal server error"})
    }
}

export const getUserPost=async(req,res)=>{
    try{
        const {username}=req.params;
        const user=await User.findOne({username})
        if(!user){
            return res.status(404).json({error :"No user found"})
        }

        const posts=await Post.find({user:user._id})
                    .sort({createdAt :-1})
                    .populate({
                        path:"user",
                        select:"-password"
                    })
                    .populate({
                        path:"comments.user",
                        select:"-password"
                    })
        res.status(200).json(posts);
    }catch(error){
        console.log(`Error in get UserPost  post_controller ${error}`)
        res.status(500).json({error :"Internal server error"})
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;

        if (!userId || !postId) {
            throw new Error('User or Post not found');
        }

        
        const post = await Post.findById({ _id: postId });
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        
        const isBookmarkedPost = user.bookmarkedPosts.includes(postId);

        if (isBookmarkedPost) {
            await User.updateOne({ _id: userId }, { $pull: { bookmarkedPosts: postId } });

            const updatedBookmarkedPost = user.bookmarkedPosts.filter((id) => id.toString() !== postId.toString());
            res.status(200).json({ message: "Post removed from bookmarks", bookmarkedPosts: updatedBookmarkedPost });
        } else {
            await User.updateOne({ _id: userId }, { $push: { bookmarkedPosts: postId } });
            res.status(200).json({ message: "Post bookmarked successfully" });
        }
    } catch (error) {
        console.log(`Error in bookmarkPost_controller: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getBookmarkPosts = async (req, res) => {
    try {
        const userId=req.user._id;
        const user = await User.findById(userId);
        if(!userId){
            return res.status(404).json({error :"No user found"})
        }

        const posts = await Post.find({
            _id: { $in: user.bookmarkedPosts }  
          }).sort({ createdAt: -1 }) .populate({
            path: "user",  
            select: "-password"  
          });
        



        return res.status(200).json({ bookmarkedPosts: posts });
    } catch (error) {
        console.log(`Error in bookmarkPost_controller: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const repostPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;
    
       
        const originalPost = await Post.findById(postId);
        if (!originalPost) {
          return res.status(404).json({ error: "Post not found" });
        }

        const existingRepost = await Post.findOne({
            user: userId,
            repostedFrom: postId, // Check if this user has already reposted this post
        });

        if (existingRepost) {
            return res.status(400).json({ error: "You have already reposted this post." });
        }
    
        
        const repost = new Post({
          user: userId, 
          text: originalPost.text, 
          img: originalPost.img,
          repostedFrom: postId, 
        });
    
        await repost.save();    
        res.status(200).json(repost); 
    
      } catch (error) {
        console.log(`Error in repostPost controller: ${error}`);
        res.status(500).json({ error: "Internal server error" });
      }
};
