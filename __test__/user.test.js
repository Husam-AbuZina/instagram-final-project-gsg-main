import "../dist/config.js";
import express from "express";
import request from "supertest";
import usersRouter from "../dist/src/routes/users.js";
import dataSource from "../dist/src/db/dataSource.js";
import { initDB } from "../dist/src/db/dataSource.js";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

dotenv.config();
const app = express();
app.use(express.json());
app.use("/users", usersRouter);
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));

beforeAll(async () => {
  await initDB();
}, 30000);

afterAll(async () => {
  await dataSource.destroy();
});
describe("Login process", () => {
  it("should login with valid credentials", async () => {
    const user = {
      email: "user2@email.com",
      password: "123456",
    };

    const response = await request(app).post("/users/login").send(user);

    expect(response.status).toBe(200);
  });

  it("should return 400 if any field is missing", async () => {
    const user = {
      password: "123456",
    };

    const response = await request(app).post("/users/login").send(user);

    expect(response.status).toBe(400);
    expect(response.body).toBe("All fields are required");
  });
});
