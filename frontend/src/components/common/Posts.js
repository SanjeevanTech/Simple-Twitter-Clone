import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import {baseUrl} from "../../constant/url.js"
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";



const Posts = ({ feedType,username,userId,postId }) => {


	const getPostEndPoint =()=>{
		switch(feedType){
			case "forYou" :
				return `${baseUrl}/api/posts/all`;
			case "following" :
				return `${baseUrl}/api/posts/following`;
			case "posts" :
				return `${baseUrl}/api/posts/user/${username}`;
			case "likes" :
				return `${baseUrl}/api/posts/likes/${userId}`;
			case "bookMark" :
				return `${baseUrl}/api/posts/bookmark`;
			default :
				return `${baseUrl}/api/posts/all`;
		}
	}

	const POST_ENDPOINT=getPostEndPoint();

	const {
		data: posts,
		isLoading,
		refetch,
		isRefetching
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT,{
					method:"GET",
					credentials:"include",
					headers:{
						"content-Type":"application/json"
					}
				});
				const data = await res.json();
				console.log("Fetched data:", data);

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				if (feedType === "bookMark" && data.bookmarkedPosts) {
					return data.bookmarkedPosts; // Return the array of bookmarked posts
				  }

				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});
	
	useEffect(() => {
		refetch();
	}, [feedType, refetch,username]);



	

	

	return (
		<>
			{isLoading  && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!(isLoading || isRefetching) &&  posts?.length === 0 && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}

				
			{!isLoading &&  posts && Array.isArray(posts) && (
				<div>
					{posts.map((post) => (
						
							<Post key={post._id} post={post} />
							
						
					))}
				</div>
			)}
		</>
	);
};
export default Posts;