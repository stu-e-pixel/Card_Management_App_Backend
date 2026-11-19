const transport = require('../config/email.config')
const OtpModel = require("../model/otp")

const sendEmailOtp = async(req,user)=>{
    console.log("🔥 sendEmailOtp FUNCTION STARTED");
    const otp = Math.floor(100000 + Math.random()*900000)
    const otpdata = await new OtpModel({userId:user._id,otp:otp})
    await otpdata.save()

    console.log("OTP SAVED SUCCESSFULLY");
    console.log("OTP ID:", otpdata._id);
    console.log("OTP User ID:", otpdata.userId);
    console.log("OTP Value:", otpdata.otp);
    console.log("OTP Created At:", otpdata.createdAt);

    await transport.sendMail({
        from:process.env.EMAIL_FROM,
        to:user.email,
        subject:"OTP - Verify your account",
        text:"",
        html:`<p>Dear ${user.name},</p><p>Thank you for signing up with our website. To complete your registration, please verify your email address by entering the following one-time password (OTP)</p>
    <h2 style="text-align: center; background-color: #a61616ff; padding: 10px;">OTP: ${otp}</h2>
    <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>`
    })

    return otp
}

module.exports=sendEmailOtp