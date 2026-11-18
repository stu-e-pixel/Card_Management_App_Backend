require("dotenv").config();
const app = require("./src/app");
const redis = require("./src/config/redis.config");
const DbConnect = require("./src/config/dbconnect");

const port = process.env.PORT;
const startserver = async () => {
    await DbConnect();
  await redis.ping();
  

  app.listen(port, () => {
    console.log(`run this application is in ${port} port`);
  });
};

startserver();
