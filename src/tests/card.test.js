
const request = require("supertest");
const app = require("../app");

const Card = require("../model/card.model");
const User = require("../model/user.model");

const statusCode = require("../utils/statuscode");
const bcrypt = require("bcryptjs");

let accessToken;
let secretKey;

// =====================================
// AUTHENTICATION SETUP
// =====================================

beforeAll(async () => {
    const password = await bcrypt.hash(
        "Password@123",
        10
    );

    await User.deleteOne({
        email: "cardtest@gmail.com",
    });

    await User.create({
        name: "Card Test User",
        email: "cardtest@gmail.com",
        phone: "9876543210",
        password,
        role: "admin",
        image: "hello.jpg",
        public_id: "test_public_id",
        is_Verified: true,
        is_Deleted: false,
        isActive: true,
        status: "active",
    });

    const loginResponse = await request(app)
        .post("/v2/api/login")
        .send({
            email: "cardtest@gmail.com",
            password: "Password@123",
        });

    console.log(
        "Card login response:",
        loginResponse.body
    );

    accessToken = loginResponse.body.accessToken;
    secretKey = loginResponse.body.secretKey;

    if (!accessToken || !secretKey) {
        throw new Error(
            "Test authentication failed. Token or secretKey missing."
        );
    }
}, 20000);

// =====================================
// CLEANUP
// =====================================

afterEach(async () => {
    await Card.deleteMany({});
});

// =====================================
// AUTH HEADERS
// =====================================

const authHeaders = () => ({
    Authorization: `Bearer ${accessToken}`,
    "x-secret-key": secretKey,
});

// =====================================
// CARD CRUD API TESTS
// =====================================

describe("Card CRUD API", () => {

    // CREATE CARD

    it("should create a card with default images", async () => {
        const res = await request(app)
            .post("/v1/api/createcard")
            .set(authHeaders())
            .send({
                title: "whiudeydteyd8",
                card_holder_name: "lksgsuyw",
                description: "iwhsuiwyuwd",
                category: "slhwius",
                phone: 8101243522,
                email: "rakib12700@gmail.com",
                website: "https://www.example.com",
                address: "mothbari",
                social_links: "https://www.example.com",
            });

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.data.title).toBe("whiudeydteyd8");
    });

    // GET ALL CARDS

    it("should get all cards", async () => {
        await Card.create({
            title: "whiudeydteyd8",
            card_holder_name: "lksgsuyw",
            description: "iwhsuiwyuwd",
            category: "slhwius",
            phone: 8101243522,
            email: "rakib12700@gmail.com",
            website: "https://www.example.com",
            address: "mothbari",
            social_links: "https://www.example.com",
        });

        const res = await request(app)
            .get("/v1/api/getCard")
            .set(authHeaders());

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].title).toBe("whiudeydteyd8");
    });

    // GET CARD BY ID

    it("should get card by id", async () => {
        const card = await Card.create({
            title: "whiudeydteyd8",
            card_holder_name: "lksgsuyw",
            description: "iwhsuiwyuwd",
            category: "slhwius",
            phone: 8101243522,
            website: "https://www.example.com",
            email: "rakib12700@gmail.com",
            address: "mothbari",
            social_links: "https://www.example.com",
        });

        const res = await request(app)
            .get(`/v1/api/getCardById/${card.id}`)
            .set(authHeaders());

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.data.title).toBe("whiudeydteyd8");
    });

    // UPDATE CARD

    it("should update card", async () => {
        const card = await Card.create({
            title: "whiudeydteyd8",
            card_holder_name: "lksgsuyw",
            description: "iwhsuiwyuwd",
            category: "slhwius",
            phone: 8101243522,
            email: "rakib12700@gmail.com",
            website: "https://www.example.com",
            address: "mothbari",
            social_links: "https://www.example.com",
        });

        const res = await request(app)
            .put(`/v1/api/updateCard/${card.id}`)
            .set(authHeaders())
            .set("Content-Type", "application/json")
            .send({
                title: "whiudeydteyd9",
            });

        console.log("Update response:", res.body);

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.data.title).toBe("whiudeydteyd9");
    });

    // SOFT DELETE CARD

    it("should delete card", async () => {
        const card = await Card.create({
            title: "whiudeydteyd9",
            card_holder_name: "lksgsuyw",
            description: "iwhsuiwyuwd",
            category: "slhwius",
            phone: 8101243522,
            email: "rakib12700@gmail.com",
            website: "https://www.example.com",
            address: "mothbari",
            social_links: "https://www.example.com",
        });

        const res = await request(app)
            .delete(`/v1/api/softdelete/${card.id}`)
            .set(authHeaders());

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.message).toBe(
            "Delete Card succesfully"
        );

        const check = await Card.findById(card.id);

        expect(check).not.toBeNull();
        expect(check.is_Deleted).toBe(true);
    });

    // RESTORE CARD

    it("should retrieve card", async () => {
        const card = await Card.create({
            title: "whiudeydteyd9",
            card_holder_name: "lksgsuyw",
            description: "iwhsuiwyuwd",
            category: "slhwius",
            phone: 8101243522,
            email: "rakib12700@gmail.com",
            website: "https://www.example.com",
            address: "mothbari",
            social_links: "https://www.example.com",
        });

        const res = await request(app)
            .patch(`/v1/api/retrivedelete/${card.id}`)
            .set(authHeaders());

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.message).toBe(
            "Delete Card retrive succesfully"
        );

        const check = await Card.findById(card.id);

        expect(check).not.toBeNull();
        expect(check.is_Deleted).toBe(false);
    });

    // PERMANENT DELETE CARD

    it("should permanently delete card", async () => {
        const card = await Card.create({
            title: "whiudeydteyd9",
            card_holder_name: "lksgsuyw",
            description: "iwhsuiwyuwd",
            category: "slhwius",
            phone: 8101243522,
            email: "rakib12700@gmail.com",
            website: "https://www.example.com",
            address: "mothbari",
            social_links: "https://www.example.com",
        });

        const res = await request(app)
            .delete(`/v1/api/forcedelete/${card.id}`)
            .set(authHeaders());

        expect(res.statusCode).toBe(statusCode.OK);
        expect(res.body.status).toBe(true);

        expect(res.body.message).toBe(
            "Delete Card succesfully"
        );

        const check = await Card.findById(card.id);

        expect(check).toBeNull();
    });

});
