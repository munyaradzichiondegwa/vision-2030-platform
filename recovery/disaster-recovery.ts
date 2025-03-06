import fs from "fs";
import path from "path";
import zlib from "zlib";
import { promisify } from "util";

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

class DisasterRecoveryManager {
  private static BACKUP_DIR = path.join(process.cwd(), "backups");
  private static MAX_BACKUPS = 10;

  // Comprehensive data backup strategy
  static async createFullBackup(
    dataSource: string,
    backupType: "full" | "incremental" = "full"
  ): Promise<string> {
    // Ensure backup directory exists
    if (!fs.existsSync(this.BACKUP_DIR)) {
      fs.mkdirSync(this.BACKUP_DIR, { recursive: true });
    }

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
    const backupFilename = `backup-${backupType}-${timestamp}.tar.gz`;
    const backupPath = path.join(this.BACKUP_DIR, backupFilename);

    try {
      // Compress and encrypt backup
      const compressedData = await this.compressData(dataSource);
      const encryptedBackup = await this.encryptBackup(compressedData);

      // Write encrypted backup
      await writeFileAsync(backupPath, encryptedBackup);

      // Manage backup retention
      await this.manageBackupRetention();

      return backupPath;
    } catch (error) {
      console.error("Backup creation failed", error);
      throw new Error("Backup creation failed");
    }
  }

  // Compress data with streaming
  private static async compressData(dataSource: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const gzip = zlib.createGzip();
      const input = fs.createReadStream(dataSource);
      const output: Buffer[] = [];

      input
        .pipe(gzip)
        .on("data", (chunk) => output.push(chunk))
        .on("end", () => resolve(Buffer.concat(output)))
        .on("error", reject);
    });
  }

  // Encrypt backup for secure storage
  private static async encryptBackup(data: Buffer): Promise<Buffer> {
    // Use advanced encryption from SecurityHardener
    const encryptedData = await SecurityHardener.encrypt(
      data.toString("base64")
    );
    return Buffer.from(encryptedData);
  }

  // Backup retention management
  private static async manageBackupRetention() {
    const backups = fs
      .readdirSync(this.BACKUP_DIR)
      .filter((file) => file.startsWith("backup-"))
      .sort()
      .reverse();

    // Remove old backups
    if (backups.length > this.MAX_BACKUPS) {
      backups.slice(this.MAX_BACKUPS).forEach((oldBackup) => {
        fs.unlinkSync(path.join(this.BACKUP_DIR, oldBackup));
      });
    }
  }

  // Comprehensive restoration strategy
  static async restoreFromBackup(
    backupFilename: string,
    restoreLocation: string
  ): Promise<boolean> {
    try {
      const backupPath = path.join(this.BACKUP_DIR, backupFilename);

      // Read and decrypt backup
      const encryptedBackup = await readFileAsync(backupPath);
      const decryptedData = await this.decryptBackup(encryptedBackup);

      // Decompress backup
      const restoredData = await this.decompressData(decryptedData);

      // Write restored data
      await writeFileAsync(restoreLocation, restoredData);

      return true;
    } catch (error) {
      console.error("Backup restoration failed", error);
      return false;
    }
  }

  // Decrypt backup
  private static async decryptBackup(data: Buffer): Promise<Buffer> {
    const decryptedBase64 = await SecurityHardener.decrypt(data.toString());
    return Buffer.from(decryptedBase64, "base64");
  }

  // Decompress data
  private static async decompressData(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      zlib.unzip(data, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
    });
  }

  // Health check and verification
  static async verifyBackupIntegrity(backupFilename: string): Promise<boolean> {
    try {
      const backupPath = path.join(this.BACKUP_DIR, backupFilename);

      // Attempt to read and decrypt
      const encryptedBackup = await readFileAsync(backupPath);
      await this.decryptBackup(encryptedBackup);

      return true;
    } catch {
      return false;
    }
  }
}

export default DisasterRecoveryManager;
