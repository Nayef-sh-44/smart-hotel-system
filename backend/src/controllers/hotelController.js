import { Op } from 'sequelize';
import {
  Hotel,
  City,
  Room,
  Amenity,
  HotelImage,
  Review,
  NearbyService,
  TouristAttraction,
  DynamicPricingRule,
  FlashDeal,
  User,
} from '../models/index.js';

export const getAllHotels = async (req, res, next) => {
  try {
    const {
      q,
      city_id,
      star_rating,
      min_price,
      max_price,
      amenities,
      sort = 'recommended',
    } = req.query;

    const whereClause = {};

    if (city_id) {
      whereClause.city_id = Number(city_id);
    }

    if (star_rating) {
      whereClause.star_rating = {
        [Op.gte]: Number(star_rating),
      };
    }

    if (min_price || max_price) {
      whereClause.base_price_per_night = {};
      if (min_price) {
        whereClause.base_price_per_night[Op.gte] = Number(min_price);
      }
      if (max_price) {
        whereClause.base_price_per_night[Op.lte] = Number(max_price);
      }
    }

    if (q) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { address: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    // Sorting options
    let orderClause = [['star_rating', 'DESC'], ['base_price_per_night', 'ASC']];
    if (sort === 'price_asc') {
      orderClause = [['base_price_per_night', 'ASC']];
    } else if (sort === 'price_desc') {
      orderClause = [['base_price_per_night', 'DESC']];
    } else if (sort === 'rating_desc') {
      orderClause = [['star_rating', 'DESC']];
    } else if (sort === 'name_asc') {
      orderClause = [['name', 'ASC']];
    }

    // Include clause
    const includeClause = [
      {
        model: City,
        as: 'city',
        attributes: ['id', 'name', 'country', 'avg_daily_food_cost', 'avg_daily_transport_cost'],
      },
      {
        model: Amenity,
        as: 'amenities',
        attributes: ['id', 'name', 'icon_class', 'category'],
        through: { attributes: ['is_free', 'additional_cost'] },
      },
      {
        model: Room,
        as: 'rooms',
        attributes: ['id', 'room_type', 'price_per_night', 'capacity', 'available_rooms', 'is_available'],
      },
      {
        model: FlashDeal,
        as: 'flashDeals',
        where: { active_status: true },
        required: false,
      },
    ];

    let hotels = await Hotel.findAll({
      where: whereClause,
      include: includeClause,
      order: orderClause,
    });

    // Filter by amenities if requested
    if (amenities) {
      const amenityIds = amenities.split(',').map((id) => Number(id.trim()));
      hotels = hotels.filter((h) => {
        const hotelAmenityIds = (h.amenities || []).map((a) => a.id);
        return amenityIds.every((reqId) => hotelAmenityIds.includes(reqId));
      });
    }

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findByPk(id, {
      include: [
        {
          model: City,
          as: 'city',
        },
        {
          model: Room,
          as: 'rooms',
        },
        {
          model: Amenity,
          as: 'amenities',
          through: { attributes: ['is_free', 'additional_cost'] },
        },
        {
          model: HotelImage,
          as: 'images',
        },
        {
          model: Review,
          as: 'reviews',
          where: { is_approved: true },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name'],
            },
          ],
        },
        {
          model: NearbyService,
          as: 'nearbyServices',
        },
        {
          model: TouristAttraction,
          as: 'attractions',
        },
        {
          model: DynamicPricingRule,
          as: 'pricingRules',
          where: { is_active: true },
          required: false,
        },
        {
          model: FlashDeal,
          as: 'flashDeals',
          where: { active_status: true },
          required: false,
        },
      ],
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hotel not found', status: 404 },
      });
    }

    res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};
