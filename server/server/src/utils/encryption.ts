import bcrypt from "bcryptjs";

class EncryptionUtil {
  private static SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateRandomToken(length = 32): string {
    return require("crypto").randomBytes(length).toString("hex");
  }
}

export default EncryptionUtil;
