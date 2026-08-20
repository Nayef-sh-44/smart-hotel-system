import { City, Hotel } from '../models/index.js';

export const getAllCities = async (req, res, next) => {
  try {
    const cities = await City.findAll({
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    next(error);
  }
};

export const getCityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const city = await City.findByPk(id, {
      include: [
        {
          model: Hotel,
          as: 'hotels',
          attributes: ['id', 'name', 'star_rating', 'base_price_per_night', 'primary_image_url', 'address'],
        },
      ],
    });

    if (!city) {
      return res.status(404).json({
        success: false,
        error: { message: 'City not found', status: 404 },
      });
    }

    res.status(200).json({
      success: true,
      data: city,
    });
  } catch (error) {
    next(error);
  }
};
