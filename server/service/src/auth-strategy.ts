import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const randomBytesAsync = promisify(randomBytes);

interface UserCredentials {
  id: string;
  email: string;
  role: string;
}

class AdvancedAuthStrategy {
  private static JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private static TOKEN_EXPIRATION = '1h';

  // Advanced password hashing with salt
  static async hashPassword(password: string): Promise<string> {
    const salt = await randomBytesAsync(16);
    const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
    return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
  }

  // Password verification
  static async verifyPassword(
    storedPassword: string, 
    providedPassword: string
  ): Promise<boolean> {
    const [salt, key] = storedPassword.split(':');
    const derivedKey = await scryptAsync(
      providedPassword, 
      Buffer.from(salt, 'hex'), 
      64
    ) as Buffer;

    return key === derivedKey.toString('hex');
  }

  // Multi-factor authentication token
  static generateMFAToken(user: UserCredentials): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'mfa'
      },
      this.JWT_SECRET,
      { 
        expiresIn: '15m',
        algorithm: 'HS256'
      }
    );
  }

  // JWT token generation with advanced claims
  static generateAccessToken(user: UserCredentials): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        // Additional claims
        iss: 'AuthService',
        aud: 'SystemUsers',
        jti: crypto.randomUUID()
      },
      this.JWT_SECRET,
      {
        expiresIn: this.TOKEN_EXPIRATION,
        algorithm: 'HS256'
      }
    );
  }

  // Refresh token generation
  static generateRefreshToken(user: UserCredentials): string {
    return jwt.sign(
      {
        sub: user.id,
        type: 'refresh'
      },
      this.JWT_SECRET,
      {
        expiresIn: '7d',
        algorithm: 'HS256'
      }
    );
  }

  // Token verification with advanced checks
  static verifyToken(token: string): UserCredentials | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        algorithms: ['HS256']
      }) as any;

      // Additional token validation
      if (decoded.type && decoded.type === 'refresh') {
        throw new Error('Invalid token type');
      }

      return {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // One-time password generation
  static generateOTP(length: number = 6): string {
    return Array.from(crypto.randomFillSync(new Uint8Array(length)))
      .map(x => Math.floor(x / 255 * 9))
      .join('');
  }
}

export default AdvancedAuthStrategy;