import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    hotel_id: user.hotel_id || null,
  };

  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, jwtConfig.secret);
};
