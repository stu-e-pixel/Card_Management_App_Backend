const multer = require('multer');
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.config')

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"uploads",
        allowed_format:["jpg","jpeg","png","gif"],
        public_id:(req,file)=>{
            `${Date.now}-${file.originalname.split(".")[0]}`
        }
    }
})

const upload = multer({storage:storage})

module.exports=upload