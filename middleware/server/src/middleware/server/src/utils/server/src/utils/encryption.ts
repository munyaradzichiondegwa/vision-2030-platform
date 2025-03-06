import crypto from "crypto";
import bcrypt from "bcryptjs";
import environmentConfig from "../config/environment";

class EncryptionUtil {
  private static SALT_ROUNDS = 12;
  private static ENCRYPTION_ALGORITHM = "aes-256-gcm";

  // Password hashing
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Data encryption
  static encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(environmentConfig.JWT_SECRET, "salt", 32);

    const cipher = crypto.createCipheriv(this.ENCRYPTION_ALGORITHM, key, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
  }

  static decrypt(encryptedData: string): string {
    const [ivHex, encryptedHex, authTagHex] = encryptedData.split(":");

    const key = crypto.scryptSync(environmentConfig.JWT_SECRET, "salt", 32);

    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(
      this.ENCRYPTION_ALGORITHM,
      key,
      iv
    );

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  }

  // Token generation
  static generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }
}

export default EncryptionUtil;
