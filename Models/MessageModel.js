const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
    {
        clubId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Club",
            required: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        }
    },
    {
        timestamps: true
    }
);
const MessageModel = mongoose.model("Message", messageSchema);
module.exports = MessageModel;