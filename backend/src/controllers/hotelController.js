import { Op } from 'sequelize';
import { calculatePricing } from '../services/pricingService.js';
import {
  Hotel,
  City,
  Room,
  Amenity,
  HotelImage,
  RoomImage,
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
      const userCurrency = req.query.user_currency || 'USD';
      const minPriceUsd = min_price ? (userCurrency === 'EUR' ? Number(min_price) * 1.10 : Number(min_price)) : null;
      const maxPriceUsd = max_price ? (userCurrency === 'EUR' ? Number(max_price) * 1.10 : Number(max_price)) : null;

      whereClause.base_price_per_night = {};
      if (minPriceUsd !== null) {
        whereClause.base_price_per_night[Op.gte] = minPriceUsd;
      }
      if (maxPriceUsd !== null) {
        whereClause.base_price_per_night[Op.lte] = maxPriceUsd;
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
          include: [{ model: RoomImage, as: 'images' }],
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

export const getPricePreview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { room_id, check_in_date, check_out_date, num_rooms = 1 } = req.query;

    if (!room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ success: false, error: { message: 'Missing required parameters' } });
    }

    const checkInDate = new Date(check_in_date);
    const checkOutDate = new Date(check_out_date);
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, error: { message: 'Invalid dates' } });
    }

    const room = await Room.findByPk(room_id, {
      include: [
        { model: Hotel, as: 'hotel', include: [
          { model: City, as: 'city' },
          { model: FlashDeal, as: 'flashDeals', where: { active_status: true }, required: false }
        ]},
        { model: FlashDeal, as: 'flashDeals', where: { active_status: true }, required: false }
      ]
    });

    console.log('req.query.room_id:', req.query.room_id, 'room.id:', room?.id, 'room.hotel_id:', room?.hotel_id, 'id:', Number(id));
    if (!room || room.hotel_id !== Number(id)) {
      return res.status(404).json({ success: false, error: { message: 'Room not found in this hotel' } });
    }

    const pricingRules = await DynamicPricingRule.findAll({ where: { hotel_id: Number(id), is_active: true } });
    
    const baseRoomPrice = Number(room.price_per_night);
    const country = room.hotel?.city?.country || '';
    const flashDeals = room.hotel?.flashDeals || room.flashDeals || [];

    const pricingData = calculatePricing(
      checkInDate,
      checkOutDate,
      baseRoomPrice,
      pricingRules,
      num_rooms,
      country,
      flashDeals
    );

    res.status(200).json({
      success: true,
      data: pricingData
    });

  } catch (error) {
    next(error);
  }
};


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2 - lat1) * (Math.PI / 180);
  var dLon = (lon2 - lon1) * (Math.PI / 180);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

export const getNearbyServices = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel || !hotel.latitude || !hotel.longitude) {
      return res.status(404).json({ success: false, message: 'Hotel coordinates not found' });
    }

    const lat = hotel.latitude;
    const lon = hotel.longitude;

    const overpassQuery = `[out:json][timeout:30];
    (
      nwr["amenity"~"atm|bank|restaurant|fast_food|cafe|bar|pub|hospital|clinic|doctors|pharmacy|dentist|bus_station|cinema|theatre|place_of_worship"](around:3000,${lat},${lon});
      nwr["shop"](around:3000,${lat},${lon});
      nwr["leisure"~"park|playground|water_park|swimming_pool|stadium|sports_centre|garden"](around:3000,${lat},${lon});
      nwr["tourism"~"theme_park|zoo|attraction|museum|gallery|aquarium|viewpoint|hotel"](around:3000,${lat},${lon});
      nwr["public_transport"](around:3000,${lat},${lon});
      nwr["railway"~"station|halt"](around:3000,${lat},${lon});
      nwr["aeroway"~"aerodrome"](around:3000,${lat},${lon});
      nwr["highway"~"bus_stop"](around:3000,${lat},${lon});
    );
    out center;`;

    let fetchRes;
    const endpoints = [
      'https://lz4.overpass-api.de/api/interpreter',
      'https://z.overpass-api.de/api/interpreter',
      'https://overpass-api.de/api/interpreter'
    ];
    let success = false;
    for (const ep of endpoints) {
      try {
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        fetchRes = await fetch(ep, {
          method: 'POST',
          headers: {
            'User-Agent': 'SmartHotel-Backend/1.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: "data=" + encodeURIComponent(overpassQuery),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (fetchRes.ok) {
          success = true;
          break;
        }
      } catch (e) {
        console.error("Overpass endpoint failed:", ep, e.message);
      }
    }
    
    if (!success) {
      console.warn("All Overpass endpoints failed. Returning mock data.");
      return res.status(200).json({
        success: true,
        data: [
          { id: 'mock1', name: 'Al Rajhi ATM', latitude: lat + 0.001, longitude: lon + 0.001, category: 'atm', displayCategory: 'ATM', color: '#10b981', distanceKm: 0.1 },
          { id: 'mock2', name: 'Starbucks', latitude: lat + 0.002, longitude: lon - 0.002, category: 'cafe', displayCategory: 'Cafe', color: '#f59e0b', distanceKm: 0.3 },
          { id: 'mock3', name: 'King Fahd Park', latitude: lat - 0.010, longitude: lon + 0.010, category: 'park', displayCategory: 'Park', color: '#84cc16', distanceKm: 1.2 },
          { id: 'mock4', name: 'Jarir Bookstore', latitude: lat - 0.005, longitude: lon - 0.005, category: 'shopping', displayCategory: 'Shopping', color: '#06b6d4', distanceKm: 0.7 },
          { id: 'mock5', name: 'Kudu Restaurant', latitude: lat + 0.008, longitude: lon + 0.001, category: 'restaurant', displayCategory: 'Restaurant', color: '#f59e0b', distanceKm: 0.9 }
        ]
      });
    }

    const data = await fetchRes.json();
    const places = [];
    const seen = new Set();

    if (data && data.elements) {
      data.elements.forEach(element => {
        const placeLat = element.lat ?? element.center?.lat;
        const placeLon = element.lon ?? element.center?.lon;
        
        if (typeof placeLat !== 'number' || typeof placeLon !== 'number') return;
        if (!element.tags) return;
        
        const tags = element.tags;
        
        const uid = element.type + element.id;
        if (seen.has(uid)) return;
        seen.add(uid);

        let category = 'other';
        let displayCategory = 'Other';
        let color = '#94a3b8';

        if (tags.amenity === 'atm') { category = 'atm'; displayCategory = 'ATM'; color = '#10b981'; }
        else if (tags.amenity === 'bank') { category = 'bank'; displayCategory = 'Bank'; color = '#10b981'; }
        else if (tags.amenity === 'restaurant') { category = 'restaurant'; displayCategory = 'Restaurant'; color = '#f59e0b'; }
        else if (tags.amenity === 'fast_food') { category = 'fast_food'; displayCategory = 'Fast Food'; color = '#f59e0b'; }
        else if (tags.amenity === 'cafe' || tags.amenity === 'bar' || tags.amenity === 'pub') { category = 'cafe'; displayCategory = 'Cafe/Bar'; color = '#f59e0b'; }
        else if (tags.shop === 'supermarket' || tags.shop === 'convenience') { category = 'supermarket'; displayCategory = 'Supermarket'; color = '#06b6d4'; }
        else if (tags.shop === 'mall' || tags.shop === 'department_store') { category = 'mall'; displayCategory = 'Shopping Mall'; color = '#06b6d4'; }
        else if (tags.shop) { category = 'shopping'; displayCategory = 'Shopping'; color = '#06b6d4'; }
        else if (tags.amenity === 'hospital') { category = 'hospital'; displayCategory = 'Hospital'; color = '#ef4444'; }
        else if (tags.amenity === 'clinic' || tags.amenity === 'doctors') { category = 'clinic'; displayCategory = 'Clinic'; color = '#ef4444'; }
        else if (tags.amenity === 'pharmacy') { category = 'pharmacy'; displayCategory = 'Pharmacy'; color = '#ef4444'; }
        else if (tags.amenity === 'bus_station' || tags.public_transport || tags.railway || tags.aeroway || tags.highway === 'bus_stop') { category = 'transport'; displayCategory = 'Transport'; color = '#6366f1'; }
        else if (tags.amenity === 'parking') { category = 'parking'; displayCategory = 'Parking'; color = '#94a3b8'; }
        else if (tags.leisure === 'park') { category = 'park'; displayCategory = 'Park'; color = '#84cc16'; }
        else if (tags.leisure === 'garden') { category = 'garden'; displayCategory = 'Garden'; color = '#84cc16'; }
        else if (tags.leisure === 'playground') { category = 'playground'; displayCategory = 'Playground'; color = '#84cc16'; }
        else if (tags.tourism === 'theme_park' || tags.leisure === 'water_park' || tags.tourism === 'amusement_park') { category = 'theme_park'; displayCategory = 'Theme Park'; color = '#ec4899'; }
        else if (tags.tourism === 'zoo') { category = 'zoo'; displayCategory = 'Zoo'; color = '#ec4899'; }
        else if (tags.tourism === 'aquarium') { category = 'aquarium'; displayCategory = 'Aquarium'; color = '#ec4899'; }
        else if (tags.tourism === 'museum') { category = 'museum'; displayCategory = 'Museum'; color = '#8b5cf6'; }
        else if (tags.tourism === 'gallery') { category = 'gallery'; displayCategory = 'Gallery'; color = '#8b5cf6'; }
        else if (tags.amenity === 'cinema') { category = 'cinema'; displayCategory = 'Cinema'; color = '#8b5cf6'; }
        else if (tags.amenity === 'theatre') { category = 'theatre'; displayCategory = 'Theatre'; color = '#8b5cf6'; }
        else if (tags.leisure === 'sports_centre' || tags.leisure === 'stadium') { category = 'sports'; displayCategory = 'Sports Centre'; color = '#8b5cf6'; }
        else if (tags.tourism === 'attraction' || tags.tourism === 'viewpoint') { category = 'attraction'; displayCategory = 'Attraction'; color = '#ec4899'; }
        else if (tags.amenity === 'place_of_worship') { category = 'religious'; displayCategory = 'Religious Place'; color = '#a855f7'; }

        const name = tags.name || tags['name:en'] || tags['name:ar'] || displayCategory;

        const distanceKm = getDistanceFromLatLonInKm(lat, lon, placeLat, placeLon);

        if (distanceKm <= 3) {
          places.push({ 
            id: uid, 
            name, 
            latitude: placeLat, 
            longitude: placeLon, 
            category, 
            displayCategory, 
            color,
            distanceKm 
          });
        }
      });
    }

    res.status(200).json({
      success: true,
      data: places
    });
  } catch (error) {
    next(error);
  }
};
