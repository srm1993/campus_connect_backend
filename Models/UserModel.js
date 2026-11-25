const mongoose=require('mongoose');
const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    yearOfJoining:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        enum:['student','faculty','admin']
    },
    status:{
        type:String,
        required:true,
        enum:['active','inactive'],
        default:"inactive"
    }
})
const UserModel=mongoose.model('user',UserSchema);
module.exports=UserModel;