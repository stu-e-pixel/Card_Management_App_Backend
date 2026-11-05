const express = require('express');
const router = express.Router();
const cardrouter = require('./apis/cardrouter')
const userrouter = require('./apis/userRouter')


router.use("/v1/api",cardrouter)
router.use("/v2/api",userrouter)

module.exports=router