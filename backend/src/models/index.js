import sequelize from '../config/database.js';
import User from './User.js';
import City from './City.js';
import Hotel from './Hotel.js';
import Room from './Room.js';
import Amenity from './Amenity.js';
import HotelAmenity from './HotelAmenity.js';
import RoomAmenity from './RoomAmenity.js';
import HotelImage from './HotelImage.js';
import RoomImage from './RoomImage.js';
import Review from './Review.js';
import Booking from './Booking.js';
import Favorite from './Favorite.js';
import SavedComparison from './SavedComparison.js';
import DynamicPricingRule from './DynamicPricingRule.js';
import FlashDeal from './FlashDeal.js';
import NearbyService from './NearbyService.js';
import TouristAttraction from './TouristAttraction.js';
import LoyaltyLevel from './LoyaltyLevel.js';
import UserLoyalty from './UserLoyalty.js';
import LoyaltyTransaction from './LoyaltyTransaction.js';
import LoyaltyReward from './LoyaltyReward.js';
import UserRewardInstance from './UserRewardInstance.js';
import LoyaltyConfig from './LoyaltyConfig.js';

// City <-> Hotel
City.hasMany(Hotel, { foreignKey: 'city_id', as: 'hotels', onDelete: 'CASCADE' });
Hotel.belongsTo(City, { foreignKey: 'city_id', as: 'city', onDelete: 'CASCADE' });

// Hotel <-> Room
Hotel.hasMany(Room, { foreignKey: 'hotel_id', as: 'rooms', onDelete: 'CASCADE' });
Room.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel', onDelete: 'CASCADE' });

// Hotel <-> HotelImage
Hotel.hasMany(HotelImage, { foreignKey: 'hotel_id', as: 'images', onDelete: 'CASCADE' });
HotelImage.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel', onDelete: 'CASCADE' });

// Room <-> RoomImage
Room.hasMany(RoomImage, { foreignKey: 'room_id', as: 'images', onDelete: 'CASCADE' });
RoomImage.belongsTo(Room, { foreignKey: 'room_id', as: 'room', onDelete: 'CASCADE' });

// Hotel <-> Amenity through HotelAmenity
Hotel.belongsToMany(Amenity, { through: HotelAmenity, foreignKey: 'hotel_id', otherKey: 'amenity_id', as: 'amenities', onDelete: 'CASCADE' });
Amenity.belongsToMany(Hotel, { through: HotelAmenity, foreignKey: 'amenity_id', otherKey: 'hotel_id', as: 'hotels', onDelete: 'NO ACTION' });

// Room <-> Amenity through RoomAmenity
Room.belongsToMany(Amenity, { through: RoomAmenity, foreignKey: 'room_id', otherKey: 'amenity_id', as: 'amenities', onDelete: 'CASCADE' });
Amenity.belongsToMany(Room, { through: RoomAmenity, foreignKey: 'amenity_id', otherKey: 'room_id', as: 'rooms', onDelete: 'NO ACTION' });

// Hotel <-> Review
Hotel.hasMany(Review, { foreignKey: 'hotel_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel', onDelete: 'CASCADE' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews', onDelete: 'NO ACTION' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'NO ACTION' });

// Hotel <-> Booking
Hotel.hasMany(Booking, { foreignKey: 'hotel_id', as: 'bookings', onDelete: 'NO ACTION' });
Booking.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel', onDelete: 'NO ACTION' });

// Room <-> Booking
Room.hasMany(Booking, { foreignKey: 'room_id', as: 'bookings', onDelete: 'NO ACTION' });
Booking.belongsTo(Room, { foreignKey: 'room_id', as: 'room', onDelete: 'NO ACTION' });

// User <-> Booking
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

// User <-> Favorite
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
Favorite.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel', onDelete: 'NO ACTION' });
Hotel.hasMany(Favorite, { foreignKey: 'hotel_id', as: 'favorites', onDelete: 'NO ACTION' });

// User <-> SavedComparison
User.hasMany(SavedComparison, { foreignKey: 'user_id', as: 'comparisons', onDelete: 'CASCADE' });
SavedComparison.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

// Hotel <-> DynamicPricingRule
Hotel.hasMany(DynamicPricingRule, { foreignKey: 'hotel_id', as: 'pricingRules', onDelete: 'CASCADE' });
DynamicPricingRule.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel', onDelete: 'CASCADE' });

// Hotel/Room <-> FlashDeal
Hotel.hasMany(FlashDeal, { foreignKey: 'hotel_id', as: 'flashDeals', onDelete: 'NO ACTION' });
FlashDeal.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel', onDelete: 'NO ACTION' });
Room.hasMany(FlashDeal, { foreignKey: 'room_id', as: 'flashDeals', onDelete: 'CASCADE' });
FlashDeal.belongsTo(Room, { foreignKey: 'room_id', as: 'room', onDelete: 'CASCADE' });

// NearbyService / TouristAttraction
City.hasMany(NearbyService, { foreignKey: 'city_id', as: 'nearbyServices', onDelete: 'NO ACTION' });
NearbyService.belongsTo(City, { foreignKey: 'city_id', as: 'city', onDelete: 'NO ACTION' });
Hotel.hasMany(NearbyService, { foreignKey: 'hotel_id', as: 'nearbyServices', onDelete: 'CASCADE' });
NearbyService.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel', onDelete: 'CASCADE' });

City.hasMany(TouristAttraction, { foreignKey: 'city_id', as: 'attractions', onDelete: 'NO ACTION' });
TouristAttraction.belongsTo(City, { foreignKey: 'city_id', as: 'city', onDelete: 'NO ACTION' });
Hotel.hasMany(TouristAttraction, { foreignKey: 'hotel_id', as: 'attractions', onDelete: 'CASCADE' });
TouristAttraction.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel', onDelete: 'CASCADE' });

// Loyalty
User.hasOne(UserLoyalty, { foreignKey: 'user_id', as: 'loyalty', onDelete: 'CASCADE' });
UserLoyalty.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
LoyaltyLevel.hasMany(UserLoyalty, { foreignKey: 'level_id', as: 'users', onDelete: 'NO ACTION' });
UserLoyalty.belongsTo(LoyaltyLevel, { foreignKey: 'level_id', as: 'level', onDelete: 'NO ACTION' });

User.hasMany(LoyaltyTransaction, { foreignKey: 'user_id', as: 'loyaltyTransactions', onDelete: 'CASCADE' });
LoyaltyTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

User.hasMany(UserRewardInstance, { foreignKey: 'user_id', as: 'rewardInstances', onDelete: 'CASCADE' });
UserRewardInstance.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
LoyaltyReward.hasMany(UserRewardInstance, { foreignKey: 'reward_id', as: 'instances', onDelete: 'NO ACTION' });
UserRewardInstance.belongsTo(LoyaltyReward, { foreignKey: 'reward_id', as: 'reward', onDelete: 'NO ACTION' });

// Hotel manager association
User.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'managedHotel', onDelete: 'NO ACTION' });

export {
  sequelize,
  User,
  City,
  Hotel,
  Room,
  Amenity,
  HotelAmenity,
  RoomAmenity,
  HotelImage,
  RoomImage,
  Review,
  Booking,
  Favorite,
  SavedComparison,
  DynamicPricingRule,
  FlashDeal,
  NearbyService,
  TouristAttraction,
  LoyaltyLevel,
  UserLoyalty,
  LoyaltyTransaction,
  LoyaltyReward,
  UserRewardInstance,
  LoyaltyConfig,
};
