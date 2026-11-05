const redis = require('redis');

const client = redis.createClient({
    url:process.env.REDIS_URL,
    RESP:2
});

client.on("error", err => console.error("Redis Error", err));


(async()=>{
    await client.connect();
    console.log("Redis is connected");
})()



module.exports=client;