const PostController=require('../Controllers/PostController')
const uploadPost=require('../Middleware/uploadPost')

const express=require('express')
const PostRouter=express.Router()

PostRouter.post('/createPost',uploadPost.single('image'),PostController.createPost);
PostRouter.get("/allPosts",PostController.allPosts);
PostRouter.get("/onePost",PostController.onePost);
PostRouter.put("/editPost/:id",PostController.editPost);
PostRouter.delete("/deletePost/:id",PostController.deletePost);
PostRouter.put('/likePost/:id',PostController.toggleLike);
PostRouter.put('/sharePost/:id',PostController.sharePosts);
PostRouter.post('/addComment/:id',PostController.addComment);
module.exports=PostRouter;