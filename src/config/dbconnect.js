const mongoose = require('mongoose');

const DbConnect = async()=>{
    try {
        const connection = mongoose.connect(process.env.MONGO_URL);
        if(connection){
            console.log("mongoDb is connected succesfully");
            
        }else{
            console.log("mongoDb is not connected");
        }
        
    } catch (error) {
        console.log(error.message);
        
    }
}

module.exports=DbConnect