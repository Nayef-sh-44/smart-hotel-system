import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'super_secret_jwt_key_for_smart_hotel_booking_node_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
