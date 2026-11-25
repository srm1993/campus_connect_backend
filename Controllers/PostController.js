const PostModel = require("../Models/PostModel");
exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Post content is required"
            });
        }
        if (!["student", "faculty"].includes(req.body.role)) {
            return res.status(403).json({
                message: "You cannot create posts"
            });
        }
        const post = await PostModel.create({
            content: content.trim(),
            image: req.file ? `/posts/${req.file.filename}` : "",
            createdBy: req.body.userid
        });
        const result = await post.populate(
            "createdBy", "name email role"
        );
        res.status(201).json({
            message: "Post created successfully",
            post: result
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.allPosts = async (req, res) => {
    try {
        const posts = await PostModel.find()
            .populate("createdBy", "name email role")
            .populate("likes", "name")
            .populate("comments.user", "name role")
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.onePost = async (req, res) => {
    try {
        const id=req.params.id;
        const posts = await PostModel.findById(id)
        res.json(posts);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.editPost = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await PostModel.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }
        if (post.createdBy.toString() !== req.body.userId.toString()) {
            return res.status(403).json({
                message: "You can edit only your own post"
            });
        }
        if (!["student", "faculty"].includes(req.body.role)) {
            return res.status(403).json({
                message: "Permission denied"
            });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Content is required"
            });
        }
        post.content = content.trim();
        await post.save();
        res.json({
            message: "Post updated successfully",
            post
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }
        const isAdmin = req.body.role === "admin";
        const isOwner =
            post.createdBy.toString() === req.body.userId.toString();
        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                message: "You cannot delete this post"
            });
        }
        await PostModel.findByIdAndDelete(req.params.id);
        res.json({
            message: "Post deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.body.userId;

        const alreadyLiked = post.likes.some(
            id => id.toString() === userId.toString()
        );

        if (alreadyLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.addToSet(userId);
        }

        await post.save();

        res.json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            likes: post.likes,
            totalLikes: post.likes.length
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { text,userId } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const post = await PostModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        post.comments.push({
            user: userId,
            text: text.trim()
        });

        await post.save();

        await post.populate("comments.user", "name role");

        res.json({
            message: "Comment added successfully",
            comments: post.comments
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.sharePosts = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.body.userId;

        const alreadyShared = post.share.some(
            id => id.toString() === userId.toString()
        );

        if (alreadyShared) {
            message:"Already Shared"
        } else {
            post.likes.addToSet(userId);
        }

        await post.save();

        res.json({
            message: alreadyShared ? "Already Shared" : "Post Shared",
            share: post.share,
            totalShared: post.share.length
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};