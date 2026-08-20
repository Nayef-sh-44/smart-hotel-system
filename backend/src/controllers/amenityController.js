import { Amenity } from '../models/index.js';

export const getAllAmenities = async (req, res, next) => {
  try {
    const amenities = await Amenity.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: amenities,
    });
  } catch (error) {
    next(error);
  }
};
