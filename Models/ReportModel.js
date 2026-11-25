const mongoose = require("mongoose");
const ReportSchema = new mongoose.Schema(
{
    clubId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required:true
    },
    studentId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required:true
    },
    ReportMessage:{
        type:String,
        required:true
    }
}
)
module.exports = mongoose.model("Report", ReportSchema);