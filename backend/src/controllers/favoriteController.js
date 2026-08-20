import { Favorite, Hotel, City } from '../models/index.js';

export const getUserFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Hotel,
          as: 'hotel',
          include: [
            {
              model: City,
              as: 'city',
              attributes: ['id', 'name', 'country'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { hotel_id } = req.body;
    if (!hotel_id) {
      return res.status(400).json({
        success: false,
        error: { message: 'hotel_id is required', status: 400 },
      });
    }

    const existing = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        hotel_id: Number(hotel_id),
      },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        message: 'Hotel is already in favorites.',
      });
    }

    const newFav = await Favorite.create({
      user_id: req.user.id,
      hotel_id: Number(hotel_id),
    });

    res.status(201).json({
      success: true,
      data: newFav,
      message: 'Added to favorites.',
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const deletedCount = await Favorite.destroy({
      where: {
        user_id: req.user.id,
        hotel_id: Number(hotelId),
      },
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Favorite not found', status: 404 },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from favorites.',
    });
  } catch (error) {
    next(error);
  }
};
