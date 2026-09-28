import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
  username: string;
}

export const signToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: (config.jwtExpiresIn || '7d') as any,
  };
  return jwt.sign(payload, config.jwtSecret as Secret, options);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret as Secret) as TokenPayload;
};
