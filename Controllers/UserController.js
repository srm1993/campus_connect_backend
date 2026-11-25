const UserModel=require('../Models/UserModel');
const crypt=require('bcrypt');

exports.createUser=async (req,res)=>{
    const body=req.body;
    console.log(body);
    if(!body.name || !body.email || !body.password || !body.phone || !body.yearOfJoining || !body.role){
        return res.json({'message':'All Fields Are Required'});
    }else{
        const newPassword=crypt.hashSync(body.password,10);
        await UserModel.create({
            name:body.name,
            email:body.email,
            password:newPassword,
            phone:body.phone,
            yearOfJoining:body.yearOfJoining,
            role:body.role
        });
        return res.json({'message':'User Created'});
    }
}
exports.loginUser=async(req,res)=>{
    const body=req.body;
    if(!body.email||!body.password){
        return res.json({"message":"Email & Password Required"})
    }else{
        const user=await UserModel.findOne({email:body.email});
        if(!user){
            return res.json({'message':'User Not Found'});
        }else{
            const matchPassword=crypt.compareSync(body.password,user.password);
            if(!matchPassword){
                return res.json({'message':'Invalid Password'});
            }else{
                if(user.status=='inactive'){
                    return res.json({'message':'You Are Not An Active User'});
                }else{
                    return res.json(user);
                }
            }
        }
    }
}
exports.allUser=async (req,res)=>{
    const users=await UserModel.find({"role":"student"});
    return res.json(users);
}
exports.allFaculty=async (req,res)=>{
    const users=await UserModel.find({"role":"faculty"});
    return res.json(users);
}

exports.changeStatus=async (req,res)=>{
    const id=req.params.id;
    const user=await UserModel.findById(id);
    const status=user.status;
    if(status=='active'){
        await UserModel.findByIdAndUpdate(id,{'status':'inactive'});
    }else{
        await UserModel.findByIdAndUpdate(id,{'status':'active'});
    }
    return res.json({'message':'Status Changed Successfully'});
}