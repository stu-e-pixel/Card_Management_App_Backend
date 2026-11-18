
const request = require("supertest");
const app = require("../app");

const User = require("../model/user.model");
const OtpModel = require("../model/otp");

const bcryptjs = require("bcryptjs");
const statusCode = require("../utils/statuscode");

let admin;
let normalUser;
let adminAuth;
let userAuth;

// =====================================
// CREATE TEST USER
// =====================================

const createTestUser = async (
    role = "user",
    email = "user@gmail.com"
) => {
    const hashedPassword = await bcryptjs.hash(
        "Password@123",
        10
    );

    return User.create({
        name: role === "admin" ? "Admin User" : "Test User",
        email,
        phone: 8101243522,
        password: hashedPassword,
        role,
        image: "hello.jpg",
        public_id: "test_public_id",
        is_Deleted: false,
        is_Verified: true,
        isActive: true,
        status: "active",
    });
};

// =====================================
// LOGIN USER
// =====================================

const loginUser = async (email) => {
    const res = await request(app)
        .post("/v2/api/login")
        .send({
            email,
            password: "Password@123",
        });

    expect(res.statusCode).toBe(statusCode.OK);
    expect(res.body.status).toBe(true);

    return {
        token: res.body.accessToken,
        secretKey: res.body.secretKey,
        refreshToken: res.body.refreshToken,
    };
};

// =====================================
// AUTH HEADERS
// =====================================

const authHeaders = (auth) => ({
    Authorization: `Bearer ${auth.token}`,
    "x-secret-key": auth.secretKey,
});

// =====================================
// BEFORE EACH TEST
// =====================================

beforeEach(async () => {
    admin = await createTestUser(
        "admin",
        "admin@gmail.com"
    );

    normalUser = await createTestUser(
        "user",
        "user@gmail.com"
    );

    adminAuth = await loginUser("admin@gmail.com");
    userAuth = await loginUser("user@gmail.com");
});

// =====================================
// AFTER EACH TEST
// =====================================

afterEach(async () => {
    await User.deleteMany({});
    await OtpModel.deleteMany({});
});

// =====================================
// USER API TESTS
// =====================================

describe("User Authentication and CRUD API", () => {

    it("should login user successfully", async () => {
        const res = await request(app)
            .post("/v2/api/login")
            .send({
                email: "user@gmail.com",
                password: "Password@123",
            });

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
        expect(res.body.secretKey).toBeDefined();

        expect(res.body.user.email).toBe("user@gmail.com");
    });

    it("should get user profile", async () => {
        const res = await request(app)
            .get("/v2/api/getprofile")
            .set(authHeaders(userAuth));

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);
        expect(res.body.user.email).toBe("user@gmail.com");
    });

    it("should get all users (Admin only)", async () => {
        const res = await request(app)
            .get("/v2/api/getAllUsers")
            .set(authHeaders(adminAuth));

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].email).toBe("user@gmail.com");
    });

    it("should get users with pagination and search", async () => {
        const res = await request(app)
            .get("/v2/api/getAllUsers")
            .query({
                name: "Test",
                email: "user@gmail.com",
                page: 1,
                limit: 5,
            })
            .set(authHeaders(adminAuth));

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);
        expect(res.body.totalUsers).toBe(1);
        expect(res.body.currentPage).toBe(1);
        expect(res.body.data[0].name).toBe("Test User");
    });

    it("should update user profile", async () => {
        const res = await request(app)
            .put(`/v2/api/update/profile/${normalUser.id}`)
            .set(authHeaders(userAuth))
            .send({
                name: "Updated User",
                phone: 9876543210,
            });

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.success).toBe(true);
    });

    it("should change user password", async () => {
        const res = await request(app)
            .post(`/v2/api/updatepassword/${normalUser.id}`)
            .set(authHeaders(userAuth))
            .send({
                currentPassword: "Password@123",
                newPassword: "NewPassword@123",
            });

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.success).toBe(true);

        expect(res.body.message).toBe(
            "Password changed successfully. Please login again."
        );

        const updatedUser = await User.findById(normalUser.id);

        const isPasswordCorrect = await bcryptjs.compare(
            "NewPassword@123",
            updatedUser.password
        );

        expect(isPasswordCorrect).toBe(true);
    });

    it("should soft delete user", async () => {
        const res = await request(app)
            .delete(`/v2/api/deleteuser/${normalUser.id}`)
            .set(authHeaders(userAuth));

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.message).toBe("User deleted succefully");

        const check = await User.findById(normalUser.id);

        expect(check).not.toBeNull();
        expect(check.is_Deleted).toBe(true);
    });

    it("should retrieve deleted user", async () => {
        await User.findByIdAndUpdate(normalUser.id, {
            is_Deleted: true,
        });

        const res = await request(app)
            .patch(`/v2/api/retrivedeleteduser/${normalUser.id}`)
            .set(authHeaders(userAuth));

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.message).toBe("User retrive succefully");

        const check = await User.findById(normalUser.id);

        expect(check).not.toBeNull();
        expect(check.is_Deleted).toBe(false);
    });

    it("should permanently delete user (Admin only)", async () => {
        const res = await request(app)
            .delete(`/v2/api/forcedeleteduser/${normalUser.id}`)
            .set(authHeaders(adminAuth));

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.message).toBe("User deleted succefully");

        const check = await User.findById(normalUser.id);

        expect(check).toBeNull();
    });

    it("should update user status (Admin only)", async () => {
        const res = await request(app)
            .post(`/v2/api/updateuserstatus/${normalUser.id}`)
            .set(authHeaders(adminAuth))
            .send({
                status: "inactive",
            });

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.message).toBe("User inactive successfully");

        const check = await User.findById(normalUser.id);

        expect(check.status).toBe("inactive");
    });

    it("should generate a new access token using refresh token", async () => {
        const res = await request(app)
            .get("/v2/api/refresh-token")
            .set(
                "Cookie",
                `refreshToken=${adminAuth.refreshToken}`
            );

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);
        expect(res.body.acessToken).toBeDefined();
    });

    it("should logout user successfully", async () => {
        const res = await request(app)
            .get("/v2/api/logout")
            .set(authHeaders(userAuth));

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.success).toBe(true);

        expect(res.body.message).toBe("Logout successful");

        const check = await User.findById(normalUser.id);

        expect(check.secretKey).toBeNull();
    });

});
