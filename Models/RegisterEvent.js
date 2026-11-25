const mongoose=require('mongoose')
const RegisterEventSchema=new mongoose.Schema({
    eventId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: "Event"
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"user"
    }
}, {
    timestamps: true
});
const RegisterEventModel=mongoose.model('registerEvent',RegisterEventSchema);
module.exports=RegisterEventModel;