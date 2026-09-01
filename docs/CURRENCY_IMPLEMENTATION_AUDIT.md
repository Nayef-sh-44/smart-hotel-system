# CURRENCY SYSTEM ARCHITECTURE AUDIT

## 1. Overview
The SmartHotelBooking currency system has been completely refactored to support strictly **EUR** and **USD** as the only valid currencies, eliminating all other dead or unsupported currencies (GBP, AED, SAR, JPY, CHF, TRY). The architecture enforces a strict separation between a Hotel's Native Currency and a User's Display Currency.

## 2. Core Concepts
- **Hotel Native Currency**: The currency in which the hotel manager sets their prices (`base_price_per_night` for the hotel, and `price_per_night` for individual rooms). It is stored in the `Hotel.currency` database column. Allowed values: `['EUR', 'USD']`.
- **User Display Currency**: The currency preferred by the user viewing the system. It is stored in `User.preferred_currency` database column. Allowed values: `['EUR', 'USD']`.
- **Atomic Scaling**: When a manager switches their native currency in the Manager Portal, the system atomically scales all prices (base price + room prices) through a mathematical conversion in a Sequelize Transaction to preserve their real economic value, without dropping data.
- **Historical Snapshots**: Bookings snapshot the exact native currency of the hotel (`Booking.currency`) along with `Booking.total_price` at the time of creation. This guarantees historical receipts never arbitrarily change if a manager switches the hotel's currency in the future.

## 3. Component Breakdown

### A. Database Layer (SQL Server)
- **`Hotels` Table**: `currency VARCHAR(3)` strictly `EUR` or `USD` (Default: `EUR`).
- **`Bookings` Table**: `currency VARCHAR(3)` strictly `EUR` or `USD`.
- **`Users` Table**: `preferred_currency VARCHAR(3)`.

### B. Backend Layer (Node/Express)
1. **Validation**: `managerController.updateHotelCurrency` validates `currency` strictly against `['EUR', 'USD']`.
2. **Utilities**: `backend/src/utils/currency.js` only exports rates for EUR (1.0) and USD (1.10). It provides `convertPrice(price, from, to)`.
3. **Filtering & Search**: `hotelController.js` dynamically converts `base_price_per_night` in the SQL `WHERE` clause using `Sequelize.literal` based on `req.query.user_currency` and `Hotel.currency`.
4. **Recommendations**: `recommendationController.js` dynamically calculates price proximity by normalizing the hotel's `basePrice` using the incoming `user_currency` parameter.

### C. Frontend Layer (React/Vite)
1. **Hook (`useCurrency.js`)**: 
   - Provides `convertPriceUtility(amount, from, to)`.
   - Normalizes the system to prevent Double Conversions.
   - Removed `toEur` workaround function.
2. **Trip Cost Calculator (`TripCostCalculator.jsx`)**: 
   - Now tracks all component costs (Hotel, Food, Transport, Activities) by aggressively converting them directly from their source currency into the `userCurrency` (User Display Currency).
   - Removed all hardcoded EUR-intermediary math.
3. **Manager Portal (`ManagerPortal.jsx`)**:
   - Cleaned the native currency dropdown to strictly offer EUR and USD.
4. **User Profile & Registration (`Profile.jsx`, `Register.jsx`)**:
   - Cleaned currency dropdowns to strictly offer EUR and USD.
5. **Views (`HotelCard.jsx`, `HotelDetail.jsx`, `MyBookings.jsx`)**:
   - Utilize `formatPrice(price, sourceCurrency)` which gracefully converts from the passed `sourceCurrency` into the user's preferred currency via `useCurrency`.

## 4. Workarounds Removed
- Dropped implicit assumption that all city averages and target prices are in EUR.
- Dropped all frontend conversion fallbacks for unsupported currencies.
- Fixed Double Conversion bugs in rendering loops.
