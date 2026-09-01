# CURRENCY SYSTEM FINAL AUDIT

## 1. The Old System
Previously, the system supported multiple currencies and allowed each Hotel Manager to select a "Native Hotel Currency" (e.g., EUR, USD). This meant that prices in the database were stored in different currencies depending on the hotel. Users could then view the system in their own "Display Currency".

## 2. Problems Caused by the Old System
- **Double Conversions:** In features like the Trip Cost Calculator or search filters, developers often mistakenly assumed the database price was in a specific currency (like EUR) and applied conversions multiple times (e.g., USD -> EUR -> USD).
- **Search Filtering:** Database queries (`max_price`) failed to work accurately because the `base_price_per_night` was stored in different currencies, requiring complex `Sequelize.literal` scaling.
- **System Complexity:** Passing around `hotel.currency` deeply through components (`HotelDetail`, `MyBookings`, `HotelCard`) caused cluttered props, UI confusion, and unnecessary API dependencies.

## 3. What Was Removed
- `Native Hotel Currency` feature entirely.
- Currency selection dropdown in the Manager Portal.
- `updateHotelCurrency` API endpoint, backend logic, and frontend service bindings.
- Legacy supported currencies like `GBP`, `AED`, `TRY`, `SAR`, `CHF`, `JPY`.
- `convertPrice(price, sourceCurrency, targetCurrency)` and `toEur` workarounds have been replaced with a streamlined USD-centric utility.
- UI elements referencing `hotel.currency` from `HotelDetail.jsx` and `HotelCard.jsx`.

## 4. The New System
**Single Source of Truth: All prices in the system are natively USD.**
- **Hotel Manager** manages their prices assuming they are in USD. There is no currency selector; they simply enter the dollar value.
- **Users** can select their preferred Display Currency (`USD` or `EUR`). This strictly controls how they *view* the prices.

## 5. Why All Hotel Prices Are USD
Standardizing on USD vastly simplifies system architecture. Aggregations, comparisons, recommendations, and search filtering can now perform direct math on the database values without dynamic currency normalization at the SQL row level.

## 6. Changing User Display Currency
Users can navigate to their Profile or Settings to change their Display Currency.
The options are strictly `USD` and `EUR`. If none is selected, the system defaults to `USD`.
The selected currency is saved to the User's profile (`preferred_currency`) in the database.

## 7. How Conversion Works
The frontend hook `useCurrency.js` provides a `formatPrice(amountInUSD)` function.
Since every price from the backend is assumed to be USD:
1. It intercepts the rendering pipeline.
2. If the user's currency is EUR, it divides the USD amount by `1.10`.
3. If the user's currency is USD, it returns the amount unmodified.
The backend utility `currency.js` functions similarly, exclusively converting to and from USD.

## 8. Search Filters
In `Hotels.jsx`, when a user filters by `Maximum Price`, they input the value in their display currency.
1. Frontend sends `max_price=90` and `user_currency=EUR`.
2. Backend (`hotelController.js`) notices the `user_currency` is EUR.
3. Backend converts the `90 EUR` into its USD equivalent (`90 * 1.10 = 99 USD`).
4. Backend runs a standard SQL check: `WHERE base_price_per_night <= 99`.

## 9. Recommendations
In `recommendationController.js`:
1. The user provides a target budget in their Display Currency.
2. The backend normalizes the target budget into USD.
3. The backend calculates proximity strictly comparing the Hotel's USD base price against the User's USD-converted budget.

## 10. Bookings
When a booking is created, the original native USD prices are snapshotted (`total_price`, `tax_amount`, `currency: 'USD'`).
Even if the user switches their display currency months later, historical booking data in the database remains accurately stored as the actual USD transaction value. When rendered in `MyBookings.jsx`, it converts the snapshotted USD amount into the user's *current* display currency for display purposes only.

## 11. Database Changes
- A migration script was executed directly on the database to convert any existing `EUR` hotel prices, room prices, and booking totals into `USD` (multiplying by 1.10).
- `currency` columns in `Hotels` and `Bookings` were hard-updated to `USD` (and their logic dependencies were fully stripped out of the codebase).
- Users with unsupported currencies were defaulted back to `USD`.

## 12. Backend Changes
- `currency.js`: Refactored to `convertFromUSD` and `convertToUSD`.
- `managerController.js`: Deleted `updateHotelCurrency`.
- `managerRoutes.js`: Deleted `PUT /hotel/currency`.
- `hotelController.js`: Simplified `max_price` SQL filter.
- `recommendationController.js`: Simplified `target_price` proximity logic.
- `bookingController.js`: Snapshot currency is hardcoded to `'USD'`.

## 13. Frontend Changes
- `useCurrency.js`: Removed `toEur` and `sourceCurrency` logic; `formatPrice` now takes a single `amountInUSD` argument.
- `ManagerPortal.jsx`: Removed Currency dropdown and `handleUpdateCurrency`; replaced with a static Pricing Notice indicating USD.
- `TripCostCalculator.jsx`: Converted all component accumulations to rely purely on `convertFromUSD`.
- `HotelCard.jsx`, `HotelDetail.jsx`, `MyBookings.jsx`: Removed `hotel.currency` variable from all `formatPrice` calls.

## 14. Testing Executed
| Test Case | Status | Details |
| :--- | :--- | :--- |
| **USD to USD** | PASS | Manager sets $100. USD User sees $100. DB stores 100. |
| **USD to EUR** | PASS | EUR User views same room. Hook converts $100 -> ~€91. |
| **Manager Portal** | PASS | Dropdown successfully stripped. Pricing Notice displays correctly. |
| **Search Filter** | PASS | 90 EUR max price successfully converted to 99 USD backend filter. |
| **Recommendations** | PASS | Budget accurately maps against native USD base price without mutation. |
| **Booking Integrity** | PASS | Bookings execute successfully, snapshotting strictly as `USD`. |
