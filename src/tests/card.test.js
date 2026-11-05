const request = require("supertest");
const app = require("../app");
const Card = require("../model/card.model");
const mongoose = require("mongoose");
const statusCode = require("../utils/statuscode");
const User = require('../model/user.model');
const bcrypt = require('bcryptjs')

let accessToken;
let secretKey;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI);
  const password = await bcrypt.hash("Password@123", 10);

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

  console.log("Card login response:", loginResponse.body);

  accessToken = loginResponse.body.accessToken;
  secretKey = loginResponse.body.secretKey;

  if (!accessToken || !secretKey) {
    throw new Error("Test authentication failed. Token or secretKey missing.");
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Card.deleteMany();
});

const authHeaders = () => ({
  Authorization: `Bearer ${accessToken}`,
  "x-secret-key": secretKey,
});

describe("Card crud API", () => {
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

    console.log("Status:", res.statusCode);
    console.log("Response:", res.body);

    expect(res.statusCode).toBe(statusCode.OK);
    expect(res.body.status).toBe(true);

    expect(res.body.data.title).toBe("whiudeydteyd8");
  });

  it("Should get all cards", async () => {
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
    .set(authHeaders())
    ;

    expect(res.statusCode).toBe(statusCode.OK);
    expect(res.body.status).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe("whiudeydteyd8");
  });

  it("should get card by id", async () => {
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
    .get(`/v1/api/getCardById/${card.id}`)
    .set(authHeaders())
    ;

    expect(res.statusCode).toBe(statusCode.OK);
    expect(res.body.status).toBe(true);
    expect(res.body.data.title).toBe("whiudeydteyd8");
  });

  it("should update card", async () => {
    console.log("STEP 1: Update test started");

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

    console.log("STEP 2: Card created:", card._id);

    const res = await request(app)
      .put(`/v1/api/updateCard/${card.id}`)
      .set(authHeaders())
      .send({ title: "whiudeydteyd9" })
      .set("Content-Type", "application/json");

    console.log("STEP 3: Request completed");
    console.log("Update status:", res.statusCode);
    console.log("Response message:", res.body.message);
    console.log("Full response:", JSON.stringify(res.body, null, 2));
    console.log("Update response:", res.body);

    expect(res.statusCode).toBe(statusCode.OK);
    expect(res.body.status).toBe(true);
    expect(res.body.data.title).toBe("whiudeydteyd9");
  });

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
      .set(authHeaders())
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(statusCode.OK);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toBe("Delete Card succesfully");

    const check = await Card.findById(card.id);
    expect(check).not.toBeNull();
    expect(check.is_Deleted).toBe(true);
  });

  it("should retrive card", async () => {
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
      .set(authHeaders())
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(statusCode.OK);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toBe("Delete Card retrive succesfully");

    const check = await Card.findById(card.id);

    expect(check).not.toBeNull();

    expect(check.is_Deleted).toBe(false);
  });

  it("should permanently deleted", async () => {
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
      .set(authHeaders())
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(statusCode.OK);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toBe("Delete Card succesfully");

    const check = await Card.findById(card.id);
    expect(check).toBeNull();
  });
});

// import mongoose from "mongoose";
// import { beforeAll, afterAll, afterEach } from "@jest/globals";
// import Card from "../models/card.model.js";

// beforeAll(async () => {
//   if (!process.env.MONGODB_TEST_URI) {
//     throw new Error("MONGODB_TEST_URI is not configured");
//   }

//   if (mongoose.connection.readyState !== 0) {
//     throw new Error("Mongoose is already connected");
//   }

//   await mongoose.connect(process.env.MONGODB_TEST_URI, {
//     serverSelectionTimeoutMS: 40000,
//   });
// }, 40000);

// afterEach(async () => {
//   await Card.deleteMany({});
// });

// afterAll(async () => {
//   if (mongoose.connection.readyState !== 0) {
//     await mongoose.connection.close();
//   }
// });
