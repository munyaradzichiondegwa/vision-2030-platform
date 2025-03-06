import AuthService from "../../services/authService";
import User from "../../models/User";
import { UserRole } from "../../types/user";
import EncryptionUtil from "../../utils/encryption";

describe("AuthService", () => {
  let testUser: any;

  beforeEach(async () => {
    // Setup test user
    testUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: await EncryptionUtil.hashPassword("password123"),
      role: UserRole.USER,
    });
    await testUser.save();
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
  });

  describe("register", () => {
    it("should successfully register a new user", async () => {
      const newUser = {
        username: "newuser",
        email: "newuser@example.com",
        password: "SecurePass123!",
      };

      const result = await AuthService.register(newUser);

      expect(result).toHaveProperty("id");
      expect(result.username).toBe(newUser.username);
      expect(result.email).toBe(newUser.email);
    });

    it("should throw error for duplicate email", async () => {
      const duplicateUser = {
        username: "duplicateuser",
        email: "test@example.com",
        password: "SecurePass123!",
      };

      await expect(AuthService.register(duplicateUser)).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("should successfully login with correct credentials", async () => {
      const loginResult = await AuthService.login(
        {
          email: "test@example.com",
          password: "password123",
        },
        "127.0.0.1",
        "TestUserAgent"
      );

      expect(loginResult).toHaveProperty("accessToken");
      expect(loginResult).toHaveProperty("refreshToken");
      expect(loginResult.user.email).toBe("test@example.com");
    });

    it("should throw error for incorrect password", async () => {
      await expect(
        AuthService.login(
          {
            email: "test@example.com",
            password: "wrongpassword",
          },
          "127.0.0.1",
          "TestUserAgent"
        )
      ).rejects.toThrow();
    });
  });
});
