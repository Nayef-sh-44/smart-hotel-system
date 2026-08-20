import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsConfig } from './config/cors.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import amenityRoutes from './routes/amenityRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import loyaltyRoutes from './routes/loyaltyRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import comparisonRoutes from './routes/comparisonRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors(corsConfig));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images if any
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint for Docker and monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/comparisons', comparisonRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('SmartHotelBooking API is running.');
});

// Error handling middleware
app.use(errorHandler);

export default app;
