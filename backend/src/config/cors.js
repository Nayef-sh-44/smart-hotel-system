import dotenv from 'dotenv';

dotenv.config();

export const corsConfig = {
  origin: [
    'http://localhost:3000', 
    'https://shaheenit.me', 
    'https://www.shaheenit.me',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};
