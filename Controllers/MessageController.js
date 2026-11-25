const mongoose = require("mongoose");
const Message = require("../Models/MessageModel");
const Club = require("../Models/ClubModel");
// Fetch messages
exports.getClubMessages = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { userId } = req.query;
        if (
            !mongoose.isValidObjectId(clubId) ||
            !mongoose.isValidObjectId(userId)
        ) {
            return res.status(400).json({
                message: "Invalid club or user ID"
            });
        }
        // Check club membership
        const club = await Club.findOne({
            _id: clubId,
            members: userId,
            status: "active"
        });
        if (!club) {
            return res.status(403).json({
                message: "You are not a member of this club"
            });
        }
        const messages = await Message.find({ clubId })
            .populate("senderId", "name")
            .sort({ createdAt: 1 });
        return res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


// Send message
exports.sendClubMessage = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { userId, message } = req.body;

        if (
            !mongoose.isValidObjectId(clubId) ||
            !mongoose.isValidObjectId(userId)
        ) {
            return res.status(400).json({
                message: "Invalid club or user ID"
            });
        }

        if (
            typeof message !== "string" ||
            !message.trim() ||
            message.trim().length > 2000
        ) {
            return res.status(400).json({
                message: "Please enter a valid message"
            });
        }

        const club = await Club.findOne({
            _id: clubId,
            members: userId,
            status: "active"
        });

        if (!club) {
            return res.status(403).json({
                message: "You are not a member of this club"
            });
        }

        const newMessage = await Message.create({
            clubId,
            senderId: userId,
            message: message.trim()
        });

        await newMessage.populate("senderId", "name");

        const io = req.app.get("io");
        io.to(`club:${clubId}`).emit("newMessage", newMessage);

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
