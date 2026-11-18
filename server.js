require("dotenv").config({ quiet: true });

const app = require("./src/app");
const {
    client: redisClient,
    connectRedis,
} = require("./src/config/redis.config");

const DbConnect = require("./src/config/dbconnect");

const port = process.env.PORT || 3037;

const startServer = async () => {
    try {
        await DbConnect();

        await connectRedis();

        await redisClient.ping();

        app.listen(port, () => {
            console.log(`Application is running on port ${port}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();