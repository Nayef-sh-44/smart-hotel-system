# SmartHotel
# Requirements Implementation Audit

## 1. Project Overview
The SmartHotel booking system is a comprehensive web application designed to manage hotel bookings, provide intelligent recommendations, calculate trip costs, compare hotels, and manage loyalty programs.

**Technology Stack:**
- **Frontend:** React, Vite, TailwindCSS, React-Router, Leaflet (for maps), Lucide-React (icons).
- **Backend:** Node.js, Express.js, Sequelize ORM.
- **Database:** Microsoft SQL Server.
- **External Services:** OpenStreetMap (via Overpass API) for Nearby Services.

------------------------------------------------------------

## 2. Implementation Summary

| ID | Requirement | Status | Main Implementation |
|----|-------------|--------|---------------------|
| REQ-001 | Create a new account | IMPLEMENTED | `authController.js`, `Register.jsx` |
| REQ-002 | Login | IMPLEMENTED | `authController.js`, `Login.jsx` |
| REQ-003 | Logout | IMPLEMENTED | `AuthContext.jsx` |
| REQ-004 | Password recovery | IMPLEMENTED | `authController.js`, `Login.jsx` (Recovery mode) |
| REQ-005 | Edit profile | IMPLEMENTED | `authController.js`, `Profile.jsx` |
| REQ-006 | Change password | IMPLEMENTED | `authController.js`, `Profile.jsx` |
| REQ-007 | Delete account | IMPLEMENTED | `authController.js`, `Profile.jsx` |
| REQ-008 | Add a new hotel | IMPLEMENTED | `adminController.js`, `AdminPortal.jsx` |
| REQ-009 | Edit hotel data | IMPLEMENTED | `managerController.js`, `ManagerPortal.jsx` |
| REQ-010 | Delete hotel | IMPLEMENTED | `adminController.js`, `AdminPortal.jsx` |
| REQ-011 | View hotel list | IMPLEMENTED | `hotelController.js`, `Hotels.jsx` |
| REQ-012 | Manage hotel images | NOT IMPLEMENTED | UI for uploading/changing hotel images is missing |
| REQ-013 | Manage hotel amenities | PARTIALLY IMPLEMENTED | DB supports it, UI missing |
| REQ-014 | Manage provided services | PARTIALLY IMPLEMENTED | DB supports it, UI missing |
| REQ-015 | Add new room | IMPLEMENTED | `managerController.js`, `ManagerPortal.jsx` |
| REQ-016 | Edit room data | PARTIALLY IMPLEMENTED | API exists (`updateRoom`), UI missing |
| REQ-017 | Delete room | IMPLEMENTED | `managerController.js`, `ManagerPortal.jsx` |
| REQ-018 | View room list | IMPLEMENTED | `managerController.js`, `ManagerPortal.jsx` |
| REQ-019 | Change room status | PARTIALLY IMPLEMENTED | DB `status` exists, UI missing |
| REQ-020 | Set room price | IMPLEMENTED | `managerController.js`, `ManagerPortal.jsx` |
| REQ-021 | Set available rooms count | IMPLEMENTED | `managerController.js`, `ManagerPortal.jsx` |
| REQ-022 | Manage room images | NOT IMPLEMENTED | UI missing |
| REQ-023 | Manage room specific amenities | NOT IMPLEMENTED | UI missing |
| REQ-024 | Search for hotels | IMPLEMENTED | `hotelController.js`, `Hotels.jsx` |
| REQ-025 | Apply search factors | PARTIALLY IMPLEMENTED | Dates/guests filtering missing from main search query |
| REQ-026 | Filter search results | IMPLEMENTED | `hotelController.js`, `Hotels.jsx` |
| REQ-027 | Run recommendation algorithm | IMPLEMENTED | `recommendationController.js`, `Hotels.jsx` |
| REQ-028 | Calculate match percentage | IMPLEMENTED | `recommendationController.js`, `Hotels.jsx` |
| REQ-029 | Sort search results | IMPLEMENTED | `hotelController.js`, `Hotels.jsx` |
| REQ-030 | Show recommended hotel | IMPLEMENTED | `Hotels.jsx` |
| REQ-031 | Show reason for recommendation | IMPLEMENTED | `recommendationController.js`, `Hotels.jsx` |
| REQ-032 | Select hotels for comparison | IMPLEMENTED | `Compare.jsx` |
| REQ-033 | Max limit for compared hotels | IMPLEMENTED | `comparisonController.js` (limit 4) |
| REQ-034 | Show comparison table | IMPLEMENTED | `Compare.jsx` |
| REQ-035 | Compare prices, ratings, location, services | IMPLEMENTED | `Compare.jsx` |
| REQ-036 | Sort comparison table | IMPLEMENTED | `Compare.jsx` |
| REQ-037 | Filter comparison table | IMPLEMENTED | `Compare.jsx` |
| REQ-038 | Go directly to hotel from comparison | IMPLEMENTED | `Compare.jsx` |
| REQ-039 | Save previous comparison tables | IMPLEMENTED | `comparisonController.js`, `Compare.jsx` |
| REQ-040 | Export comparison to PDF | IMPLEMENTED | `Compare.jsx` (`html2pdf.js`) |
| REQ-041 | Handle unavailable services indicator | IMPLEMENTED | `comparisonController.js`, `Compare.jsx` |
| REQ-042 | Remove a hotel from comparison | IMPLEMENTED | `Compare.jsx` |
| REQ-043 | Show nearby tourist attractions & services | IMPLEMENTED | `HotelDetail.jsx` (Overpass API) |
| REQ-044 | Calculate distance | IMPLEMENTED | `HotelDetail.jsx` (Haversine formula) |
| REQ-045 | Show map & locations | IMPLEMENTED | `HotelDetail.jsx` (`react-leaflet`) |
| REQ-046 | Calculate hotel cost | IMPLEMENTED | `TripCostCalculator.jsx` |
| REQ-047 | Calculate accommodation cost (days/guests) | IMPLEMENTED | `TripCostCalculator.jsx` |
| REQ-048 | Calculate transport & food cost | IMPLEMENTED | `TripCostCalculator.jsx` |
| REQ-049 | Show total trip cost | IMPLEMENTED | `TripCostCalculator.jsx` |
| REQ-050 | Add/remove favorites | IMPLEMENTED | `favoriteController.js`, `Favorites.jsx` |
| REQ-051 | View favorite hotels | IMPLEMENTED | `favoriteController.js`, `Favorites.jsx` |
| REQ-052 | Use favorites for recommendations | IMPLEMENTED | `recommendationController.js` |
| REQ-053 | City information (time, weather) | UNVERIFIED | Could not locate dynamic weather implementation |
| REQ-054 | Review management (add, edit, delete, view) | IMPLEMENTED | `reviewController.js`, `HotelDetail.jsx` |
| REQ-055 | Calculate average rating | IMPLEMENTED | `hotelController.js`, `HotelDetail.jsx` |
| REQ-056 | Create new booking | IMPLEMENTED | `bookingController.js`, `HotelDetail.jsx` |
| REQ-057 | Verify room availability | IMPLEMENTED | `bookingController.js` |
| REQ-058 | Confirm/Save/Cancel booking | IMPLEMENTED | `bookingController.js`, `MyBookings.jsx` |
| REQ-059 | Dynamic pricing & Benchmarking | IMPLEMENTED | `managerController.js`, `ManagerPortal.jsx` |
| REQ-060 | Flash Deals | IMPLEMENTED | `managerController.js`, `ManagerPortal.jsx` |
| REQ-061 | Protect competitor hotels data | IMPLEMENTED | `managerController.js` |
| REQ-062 | Loyalty (calculate, add, view points) | IMPLEMENTED | `bookingController.js`, `loyaltyController.js` |
| REQ-063 | Redeem points for voucher/discount | IMPLEMENTED | `bookingController.js` |
| REQ-064 | Currency Support | IMPLEMENTED | `useCurrency.js` |

------------------------------------------------------------

## 3. Detailed Requirement Implementation

### REQ-001 / REQ-004 � Password Recovery (Security Questions)
**Status:** IMPLEMENTED
**How It Was Implemented:**
During registration, the user selects two security questions from a dropdown and provides answers. During password recovery (in the `Login.jsx` interface via "Forgot Password"), the system prompts the user with those exact two questions. The user must answer correctly to reset the password. There are no email verifications.
**Frontend Implementation:**
- `frontend/src/pages/Register.jsx`
- `frontend/src/pages/Login.jsx`
**Backend Implementation:**
- `backend/src/routes/authRoutes.js`
- `backend/src/controllers/authController.js`
**API:**
- `POST /api/auth/register`
- `POST /api/auth/verify-answers`
**Important Functions:**
- `verifySecurityAnswers()` in `authController.js`

### REQ-027 / REQ-028 / REQ-031 � Recommendation Engine & Match Percentage
**Status:** IMPLEMENTED
**How It Was Implemented:**
The system calculates a deterministic recommendation score out of ~100 based on Star Rating (Weight 1.5), Trip Type Alignment (Business/Family/Couple), Price Proximity (Weight 2.0), Amenity Overlap, Review Rating, and Active Flash Deals. The city is properly excluded from the scoring weights as it is used as a hard filter. The match percentage is displayed as a `% Match` badge. Match reasons (e.g., "Ideal for Couples") are returned and displayed.
**Frontend Implementation:**
- `frontend/src/pages/Hotels.jsx`
- `frontend/src/components/HotelCard.jsx`
**Backend Implementation:**
- `backend/src/controllers/recommendationController.js`
**API:**
- `GET /api/recommendations`
**Important Functions:**
- `getRecommendations()` in `recommendationController.js`
- `HotelCard.jsx` rendering logic.

### REQ-032 to REQ-042 � Hotel Comparison
**Status:** IMPLEMENTED
**How It Was Implemented:**
Users can add up to 4 hotels to a comparison matrix. The backend aggregates the data into a unified matrix, resolving empty fields with a fallback object (`available: false`) which renders as a "not available" indicator. The UI allows sorting, filtering, and exporting the table to PDF using `html2pdf.js`. The user can also save the comparison list to their profile.
**Frontend Implementation:**
- `frontend/src/pages/Compare.jsx`
**Backend Implementation:**
- `backend/src/controllers/comparisonController.js`
**API:**
- `POST /api/comparison/matrix`
- `POST /api/comparison/saved`
**Important Functions:**
- `getSideBySideComparison()` in `comparisonController.js`
- `handleExportPDF()` in `Compare.jsx`

### REQ-043 to REQ-045 � Map & Nearby Services
**Status:** IMPLEMENTED
**How It Was Implemented:**
The application uses `react-leaflet` for rendering maps and the Overpass API to fetch real-time OSM data for nearby tourist attractions, restaurants, cafes, pharmacies, ATMs, and hospitals. The Haversine formula is used directly in the frontend to calculate the distance between the hotel and the fetched point of interest.
**Frontend Implementation:**
- `frontend/src/pages/HotelDetail.jsx`
**Important Functions:**
- `getDistanceFromLatLonInKm()` in `HotelDetail.jsx`
- `MapUpdater()` component hook for Leaflet.

### REQ-046 to REQ-049 � Trip Cost Calculator
**Status:** IMPLEMENTED
**How It Was Implemented:**
An interactive calculator multiplies the room price by the number of rooms and nights. It also fetches the `avg_daily_food_cost` and `avg_daily_transport_cost` from the city, and multiplies them by the total number of guests (adults + children) and trip days. 
**Frontend Implementation:**
- `frontend/src/pages/TripCostCalculator.jsx`

### REQ-061 � Protect Competitor Hotels Data
**Status:** IMPLEMENTED
**How It Was Implemented:**
In the Manager Portal, the `getCompetitorBenchmarking` endpoint fetches other hotels in the same city. However, it explicitly aggregates the data (calculating `marketAvgPrice`, `marketAvgStarRating`, etc.) and returns only the averages to the frontend, strictly protecting the individual competitor data.
**Backend Implementation:**
- `backend/src/controllers/managerController.js`
**Important Functions:**
- `getCompetitorBenchmarking()`

### REQ-008 & REQ-010 � Hotel Manager & Hotel Architecture
**Status:** IMPLEMENTED
**How It Was Implemented:**
Following the strict business rule of 1 Hotel = 1 Manager, the Admin creates a Manager account without selecting a hotel. The backend automatically creates a new Hotel inside a SQL transaction, links it to the new manager, and assigns a unique local image path. Deleting the manager account automatically deletes the associated hotel and safely cleans up dependent records (Bookings, Favorites, FlashDeals).
**Backend Implementation:**
- `backend/src/controllers/adminController.js`
**API:**
- `POST /api/admin/users`
- `DELETE /api/admin/users/:id`

------------------------------------------------------------

## Google Meet Demonstration Guide

### 1. Password Recovery
**Browser:** Open `/login`, click "Forgot Password".
**Action:** Show that it asks for the two custom security questions defined during registration.
**Code:** Open `frontend/src/pages/Login.jsx` and `backend/src/controllers/authController.js` (`verifySecurityAnswers`).

### 2. Recommendation Engine
**Browser:** Open `/hotels`, execute a search.
**Action:** Highlight the "% Match" and the match reason (e.g., "Ideal for Couples").
**Code:** Open `backend/src/controllers/recommendationController.js` to show that city is omitted from scoring weights, and how `recommendationScore` is calculated.

### 3. Competitor Benchmarking
**Browser:** Login as Hotel Manager, open Manager Portal.
**Action:** Show the "Competitor Benchmarking" tab and the market averages.
**Code:** Open `backend/src/controllers/managerController.js` (`getCompetitorBenchmarking`) to prove that competitor arrays are aggregated and never sent back directly, protecting competitor data.

### 4. Admin Architecture (Atomic Creation/Deletion)
**Browser:** Login as System Admin.
**Action:** Click "Create Hotel Manager". Note the ABSENCE of a "Select Hotel" dropdown. Create a manager.
**Code:** Open `backend/src/controllers/adminController.js` (`createUser`) to show the SQL Transaction (`sequelize.transaction()`) that atomically creates both the Hotel and the Manager together.

### 5. Maps & Nearby Services
**Browser:** Open a Hotel Details page.
**Action:** Scroll to the Leaflet Map. Click the filters (ATMs, Pharmacies, Restaurants).
**Code:** Open `frontend/src/pages/HotelDetail.jsx` to show the Overpass API query and the `getDistanceFromLatLonInKm` Haversine implementation.

------------------------------------------------------------

## Missing / Partial Requirements

**1. Room and Hotel Management UI**
- **What is missing:** The UI for editing room details, changing room status (available/booked/out of service), and uploading hotel/room images.
- **What exists:** The `Room` and `Hotel` database models fully support these fields (`status`, `is_available`, `main_image`). The backend API has `updateRoom`.
- **To fix:** Add image upload fields and status dropdowns in `ManagerPortal.jsx`.

**2. Search Filters by Date and Guests**
- **What is missing:** The main search endpoint (`getHotels`) does not filter hotels out if they are fully booked for the selected dates.
- **What exists:** Filtering by City, Price, Rating, and Amenities.
- **To fix:** Update `hotelController.js` to include a date-overlap availability check on the `Rooms` association.

## Unverified Requirements

**1. City Information (Weather/Best Time to Visit)**
- Code for fetching dynamic weather or "best time to visit" was not clearly identified in the main UI flows.

## File Cleanups Performed
- **18 Temporary files removed:** `verifyDb.js`, `verifyApi.js`, `testDelete.js`, `patch_hotelcard.js`, `checkDocker.sh`, etc.
- **Result:** The project root is clean and free of testing/debugging artifacts.
