import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

const ENV_PATH = path.resolve('.env');

export const ensureJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  const secret = crypto.randomBytes(48).toString('hex');

  const line = `\nJWT_SECRET=${secret}\n`;
  fs.appendFileSync(ENV_PATH, line, 'utf8');
  process.env.JWT_SECRET = secret;
  return secret;
};

export const hashPassword = async (password) => bcryptjs.hash(password, 10);

export const verifyPassword = async (password, hash) => bcryptjs.compare(password, hash);

export const generateTotpSecret = async (label) => {
  const secret = speakeasy.generateSecret({ name: label });
  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  return {
    base32: secret.base32,
    otpauthUrl: secret.otpauth_url,
    qrCode,
  };
};

export const verifyTotp = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
};

export const signJwt = (payload) => {
  const jwtSecret = ensureJwtSecret();
  return jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
};

export const verifyJwt = (token) => {
  const jwtSecret = ensureJwtSecret();
  return jwt.verify(token, jwtSecret);
};
