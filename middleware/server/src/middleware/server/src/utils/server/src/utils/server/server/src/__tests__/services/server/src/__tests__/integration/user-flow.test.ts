import request from "supertest";
import app from "../../app";
import DatabaseConnection from "../../config/database";
import User from "../../models/User";

describe("User Flow Integration", () => {
  let authToken: string;

  beforeAll(async () => {
    await DatabaseConnection.connect();
  });

  afterAll(async () => {
    await DatabaseConnection.disconnect();
  });

  beforeEach(async () => {
    // Setup test user and get auth token
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        username: "integrationuser",
        email: "integration@test.com",
        password: "SecurePass123!",
      });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "integration@test.com",
      password: "SecurePass123!",
    });

    authToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it("should complete full user registration and profile update flow", async () => {
    // Update profile
    const profileUpdateResponse = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        firstName: "Integration",
        lastName: "User",
        bio: "Test integration user",
      });

    expect(profileUpdateResponse.status).toBe(200);
    expect(profileUpdateResponse.body.profile.firstName).toBe("Integration");
  });
});
