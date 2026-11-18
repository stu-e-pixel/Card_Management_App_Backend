
const mongoose = require("mongoose");

// Mock email utility before application modules are imported.
jest.mock("../utils/sendEmailOtp", () =>
    jest.fn().mockResolvedValue(true)
);

// Connect to the test database before each test file.
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
}, 20000);

// Close the database connection after each test file.
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log("Test MongoDB connection closed");
    }
});
