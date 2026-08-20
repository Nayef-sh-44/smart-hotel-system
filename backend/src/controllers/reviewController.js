import { Review, User } from '../models/index.js';

export const getHotelReviews = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const reviews = await Review.findAll({
      where: {
        hotel_id: Number(hotelId),
        is_approved: true,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const {
      hotel_id,
      booking_id,
      cleanliness_rating,
      location_rating,
      service_rating,
      value_rating,
      overall_rating,
      comment,
    } = req.body;

    if (!hotel_id || !overall_rating) {
      return res.status(400).json({
        success: false,
        error: { message: 'hotel_id and overall_rating are required', status: 400 },
      });
    }

    const review = await Review.create({
      user_id: req.user.id,
      hotel_id: Number(hotel_id),
      booking_id: booking_id ? Number(booking_id) : null,
      cleanliness_rating: Number(cleanliness_rating || overall_rating),
      location_rating: Number(location_rating || overall_rating),
      service_rating: Number(service_rating || overall_rating),
      value_rating: Number(value_rating || overall_rating),
      overall_rating: Number(overall_rating),
      comment: comment || '',
      is_approved: true, // Approved for customer portal feedback
    });

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
