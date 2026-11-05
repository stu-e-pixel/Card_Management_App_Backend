const statuscode = require("../utils/statuscode")

class Validation{
    static validate(Schema){
        return (req,res,next)=>{
            const {error,value}= Schema.validate(req.body,{
                abortEarly:false,
                stripUnknown:false
            })

            if(error){
                return res.status(statuscode.NOT_FOUND).json((err)=>({
                    field:err.path.join('.'),
                    message:err.message
                }))
            }

            req.body=value;
            next()
        }
    }
}

module.exports=Validation