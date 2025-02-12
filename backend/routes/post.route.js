import express from "express"
import protectRoute from "../middleware/protectRoute.js";
import {createPost,deletePost,createComment,likeUnlikePost,getAllPosts,
    getLikedPosts,getFollowingPost,getUserPost,bookmarkPost,getBookmarkPosts,repostPost} from "../controller/post.controller.js"

const router=express.Router();

router.get("/all",protectRoute,getAllPosts)
router.post("/create",protectRoute,createPost)
router.get("/following",protectRoute,getFollowingPost)
router.get("/likes/:id",protectRoute,getLikedPosts)
router.get("/user/:username",protectRoute,getUserPost)
router.post("/like/:id",protectRoute,likeUnlikePost)
router.post("/comment/:id",protectRoute,createComment)
router.delete("/:id",protectRoute,deletePost)
router.post("/bookmark/:postId",protectRoute,bookmarkPost)
router.get("/bookmark",protectRoute,getBookmarkPosts)
router.post("/repost/:postId",protectRoute,repostPost)




export default router;
