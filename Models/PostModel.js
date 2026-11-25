const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    image: {
        type: String,
        default: ""
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    share: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    comments: [commentSchema]
}, { timestamps: true });
module.exports = mongoose.model("Post", postSchema);