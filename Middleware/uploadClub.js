const multer=require('multer')
const path=require('path')
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./clubs');
    },
    filename:(req,file,cb)=>{
        let filename=Date.now()+path.extname(file.originalname)
        cb(null,filename);
    }
})
const uploadClub=multer({storage})
module.exports=uploadClub;