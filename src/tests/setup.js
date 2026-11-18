require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");

const {
    client: redisClient,
    connectRedis,
} = require("../config/redis.config");

// Mock email utility before application modules are imported.
jest.mock("../utils/sendEmailOtp", () =>
    jest.fn().mockResolvedValue(true)
);

beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
        throw new Error("MONGODB_TEST_URI is not configured");
    }

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_TEST_URI, {
            serverSelectionTimeoutMS: 15000,
        });

        console.log("Test MongoDB connected successfully");
    }

    await connectRedis();
    console.log("Test Redis connected successfully");
}, 30000);

afterAll(async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("Test MongoDB connection closed");
        }

        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log("Test Redis connection closed");
        }
    } catch (error) {
        console.error("Test cleanup error:", error);
    }
});