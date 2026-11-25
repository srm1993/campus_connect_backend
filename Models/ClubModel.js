const mongoose = require("mongoose");
const clubSchema = new mongoose.Schema(
  {
    clubName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Technical",
        "Cultural",
        "Sports",
        "Literary",
        "Photography",
        "Entrepreneurship",
        "Other"
      ]
    },

    image: {
      type: String,
      default: ""
    },

    rules: {
      type: String,
      default: ""
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      }
    ],

    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active"
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    deletionReason: {
      type: String,
      default: ""
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);
clubSchema.index({ clubName: 1 });
module.exports = mongoose.model("Club", clubSchema);