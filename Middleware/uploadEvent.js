const multer=require('multer')
const path=require('path')
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./events');
    },
    filename:(req,file,cb)=>{
        let filename=Date.now()+path.extname(file.originalname)
        cb(null,filename);
    }
})
const uploadEvent=multer({storage})
module.exports=uploadEvent;