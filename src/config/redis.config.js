const redis = require("redis");

const client = redis.createClient({
    url: process.env.REDIS_URL,
});

client.on("error", (err) => {
    console.error("Redis Error:", err);
});

const connectRedis = async () => {
    if (!client.isOpen) {
        await client.connect();
        console.log("Redis is connected");
    }
};

module.exports = {
    client,
    connectRedis,
};