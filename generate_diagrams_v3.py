import zlib
import base64
import urllib.request
import os

DIAGRAMS_DIR = r"E:\SmartHotelBooking_Node\docs\diagrams"

def generate_kroki_url(diagram_type, output_format, text):
    compressed = zlib.compress(text.encode('utf-8'), 9)
    encoded = base64.urlsafe_b64encode(compressed).decode('utf-8')
    return f"https://kroki.io/{diagram_type}/{output_format}/{encoded}"

def download_diagram(diagram_type, output_format, text, filename):
    url = generate_kroki_url(diagram_type, output_format, text)
    filepath = os.path.join(DIAGRAMS_DIR, filename)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Saved: {filepath}")
    except Exception as e:
        print(f"Failed to save {filepath}: {e}")

erd_puml = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam linetype ortho
hide circle
hide empty members

title HotelLink Entity Relationship Diagram (Vertical)

' Central Spine
entity City {
  * id : INT [PK]
  * name : VARCHAR
}
entity Hotel {
  * id : INT [PK]
  * name : VARCHAR
  base_price_per_night : DECIMAL
}
entity Room {
  * id : INT [PK]
  * room_type : VARCHAR
  price_per_night : DECIMAL
  capacity : INT
  available_rooms : INT
  status : ENUM
}
entity Booking {
  * id : INT [PK]
  booking_reference : VARCHAR
  check_in_date : DATE
  check_out_date : DATE
  num_guests : INT
  total_price : DECIMAL
  status : ENUM
}
entity User {
  * id : INT [PK]
  * full_name : VARCHAR
  * email : VARCHAR
  * role : ENUM
  preferred_currency : VARCHAR
}
entity Review {
  * id : INT [PK]
  overall_rating : INT
}

City ||-down-o{ Hotel
Hotel ||-down-o{ Room
Room ||-down-o{ Booking
Booking }o-down-|| User
User ||-down-o{ Review

' Left Side
entity NearbyService { }
entity HotelImage { }
entity RoomImage { }
entity Favorite { }

City ||-left-o{ NearbyService
Hotel ||-left-o{ HotelImage
Room ||-left-o{ RoomImage
User ||-left-o{ Favorite

' Right Side
entity TouristAttraction { }
entity DynamicPricingRule { }
entity FlashDeal { }
entity SavedComparison { }

City ||-right-o{ TouristAttraction
Hotel ||-right-o{ DynamicPricingRule
Room ||-right-o{ FlashDeal
User ||-right-o{ SavedComparison

' Loyalty Stack (bottom right)
entity UserLoyalty { }
entity LoyaltyReward { }

Review -[hidden]down-> UserLoyalty
UserLoyalty -[hidden]down-> LoyaltyReward

User ||-down-o{ UserLoyalty
Hotel ||-down-o{ LoyaltyReward

' Amenities (left side)
entity Amenity { }
entity HotelAmenity { }
entity RoomAmenity { }

HotelImage -[hidden]down-> HotelAmenity
HotelAmenity -[hidden]down-> Amenity
Amenity -[hidden]down-> RoomAmenity

Hotel ||-left-o{ HotelAmenity
Amenity ||-right-o{ HotelAmenity
Room ||-left-o{ RoomAmenity
Amenity ||-right-o{ RoomAmenity
@enduml
"""

usecase_puml = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam packageStyle rectangle

title HotelLink Use Case Diagram (Vertical)

actor "Guest" as Guest
actor "Registered\\nUser" as RegUser
actor "Hotel\\nManager" as Manager
actor "System\\nAdministrator" as Admin

Guest -down-|> RegUser
RegUser -[hidden]down-> Manager
Manager -[hidden]down-> Admin

rectangle "HotelLink System" {
  package "1. Search & Discovery" {
    usecase "Search & Filter Hotels" as UC_Search
    usecase "View Hotel Details" as UC_Details
    usecase "View Nearby Services\\n& Attractions" as UC_Nearby
    
    UC_Search -[hidden]down-> UC_Details
    UC_Details -[hidden]down-> UC_Nearby
  }
  
  package "2. User Account & Engagement" {
    usecase "Register & Login" as UC_Login
    usecase "Manage Profile" as UC_Profile
    usecase "Change Display Currency" as UC_Currency
    usecase "Manage Favorites" as UC_Favorites
    usecase "Write & Manage Reviews" as UC_Reviews
    usecase "Compare Hotels" as UC_Compare
    usecase "Save Hotel Comparison" as UC_SaveCompare
    usecase "Export Comparison (PDF)" as UC_ExportCompare
    usecase "Create Multi-Dest Trip Plan" as UC_TripPlan
    usecase "Calculate Trip Cost" as UC_TripCost
    usecase "Export Trip Plan (PDF)" as UC_ExportTrip

    UC_Login -[hidden]down-> UC_Profile
    UC_Profile -[hidden]down-> UC_Currency
    UC_Currency -[hidden]down-> UC_Favorites
    UC_Favorites -[hidden]down-> UC_Reviews
    UC_Reviews -[hidden]down-> UC_Compare
    UC_Compare -[hidden]down-> UC_SaveCompare
    UC_SaveCompare -[hidden]down-> UC_ExportCompare
    UC_ExportCompare -[hidden]down-> UC_TripPlan
    UC_TripPlan -[hidden]down-> UC_TripCost
    UC_TripCost -[hidden]down-> UC_ExportTrip
    
    UC_TripPlan .right.> UC_TripCost : <<include>>
    UC_TripPlan .right.> UC_ExportTrip : <<extend>>
    UC_Compare .right.> UC_SaveCompare : <<extend>>
    UC_SaveCompare .right.> UC_ExportCompare : <<extend>>
  }

  package "3. Booking & Loyalty" {
    usecase "Create Booking" as UC_Booking
    usecase "Manage My Bookings" as UC_ManageBooking
    usecase "View Recommendations" as UC_Recommendations
    usecase "Use Loyalty Program" as UC_Loyalty
    usecase "Redeem Loyalty Rewards" as UC_Redeem

    UC_Booking -[hidden]down-> UC_ManageBooking
    UC_ManageBooking -[hidden]down-> UC_Recommendations
    UC_Recommendations -[hidden]down-> UC_Loyalty
    UC_Loyalty -[hidden]down-> UC_Redeem
    
    UC_Loyalty .right.> UC_Redeem : <<extend>>
  }
  
  package "4. Hotel Management" {
    usecase "Manage Hotel Profile\\n& Images" as UC_MgrHotel
    usecase "Manage Rooms\\n& Images" as UC_MgrRooms
    usecase "Manage Room Availability" as UC_MgrAvail
    usecase "Manage Dynamic Pricing Rules" as UC_MgrPricing
    usecase "Manage Flash Deals" as UC_MgrFlash
    usecase "View Competitor Benchmarking" as UC_MgrBench
    usecase "View Hotel Bookings" as UC_MgrBookings

    UC_MgrHotel -[hidden]down-> UC_MgrRooms
    UC_MgrRooms -[hidden]down-> UC_MgrAvail
    UC_MgrAvail -[hidden]down-> UC_MgrPricing
    UC_MgrPricing -[hidden]down-> UC_MgrFlash
    UC_MgrFlash -[hidden]down-> UC_MgrBench
    UC_MgrBench -[hidden]down-> UC_MgrBookings
  }
  
  package "5. System Administration" {
    usecase "Create Hotel Manager\\n(Assigns Hotel)" as UC_AdminCreateMgr
    usecase "Delete Hotel Manager" as UC_AdminDelMgr
    usecase "Delete Registered User" as UC_AdminDelUser

    UC_AdminCreateMgr -[hidden]down-> UC_AdminDelMgr
    UC_AdminDelMgr -[hidden]down-> UC_AdminDelUser
  }
  
  UC_Nearby -[hidden]down-> UC_Login
  UC_ExportTrip -[hidden]down-> UC_Booking
  UC_Redeem -[hidden]down-> UC_MgrHotel
  UC_MgrBookings -[hidden]down-> UC_AdminCreateMgr
}

Guest -right-> UC_Search
Guest -right-> UC_Details
Guest -right-> UC_Nearby

RegUser -right-> UC_Login
RegUser -right-> UC_Profile
RegUser -right-> UC_Currency
RegUser -right-> UC_Favorites
RegUser -right-> UC_Reviews
RegUser -right-> UC_Compare
RegUser -right-> UC_TripPlan
RegUser -right-> UC_Booking
RegUser -right-> UC_ManageBooking
RegUser -right-> UC_Recommendations
RegUser -right-> UC_Loyalty

Manager -right-> UC_Login
Manager -right-> UC_MgrHotel
Manager -right-> UC_MgrRooms
Manager -right-> UC_MgrAvail
Manager -right-> UC_MgrPricing
Manager -right-> UC_MgrFlash
Manager -right-> UC_MgrBench
Manager -right-> UC_MgrBookings

Admin -right-> UC_Login
Admin -right-> UC_AdminCreateMgr
Admin -right-> UC_AdminDelMgr
Admin -right-> UC_AdminDelUser
@enduml
"""

class_puml = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam linetype ortho
hide empty members

title HotelLink Class Diagram (Strict Vertical)

class AuthController {
  + register()
  + login()
}
class BookingController {
  + createBooking()
}
class RecommendationController {
  + getRecommendations()
}
class ManagerController {
  + manageHotel()
}
class AdminController {
  + createManager()
  + deleteUser()
}

class PricingService {
  + calculatePricing()
}
class CurrencyUtils {
  + convertCurrency()
}

class User {
  + id: Integer
  + full_name: String
  + role: Enum
}
class City {
  + id: Integer
  + name: String
}
class Hotel {
  + id: Integer
  + name: String
  + base_price_per_night: Decimal
}
class Room {
  + id: Integer
  + room_type: String
  + price_per_night: Decimal
}
class Booking {
  + id: Integer
  + check_in_date: Date
  + total_price: Decimal
}
class Review {
  + id: Integer
  + overall_rating: Integer
}
class DynamicPricingRule {
  + id: Integer
  + multiplier: Decimal
}
class FlashDeal {
  + id: Integer
  + discount_percentage: Decimal
}
class LoyaltyReward {
  + id: Integer
  + points_cost: Integer
}

' The absolute central spine
AuthController -[hidden]down-> BookingController
BookingController -[hidden]down-> RecommendationController
RecommendationController -[hidden]down-> ManagerController
ManagerController -[hidden]down-> AdminController
AdminController -[hidden]down-> PricingService
PricingService -[hidden]down-> CurrencyUtils
CurrencyUtils -[hidden]down-> User
User -[hidden]down-> City
City -[hidden]down-> Hotel
Hotel -[hidden]down-> Room
Room -[hidden]down-> Booking
Booking -[hidden]down-> Review
Review -[hidden]down-> DynamicPricingRule
DynamicPricingRule -[hidden]down-> FlashDeal
FlashDeal -[hidden]down-> LoyaltyReward

' Relationships mapping around the spine
City "1" -- "*" Hotel
Hotel "1" -- "*" Room
User "1" -- "*" Booking
Room "1" -- "*" Booking
User "1" -- "*" Review
Hotel "1" -- "*" Review
Hotel "1" -- "*" DynamicPricingRule
Hotel "1" -- "*" LoyaltyReward
Hotel "1" -- "*" FlashDeal

BookingController ..> PricingService
PricingService ..> Booking
CurrencyUtils ..> User
ManagerController ..> Hotel
RecommendationController ..> Hotel
AdminController ..> User
@enduml
"""

# Save PlantUML source files for reference
with open(os.path.join(DIAGRAMS_DIR, "01_HotelLink_ERD.puml"), "w") as f: f.write(erd_puml)
with open(os.path.join(DIAGRAMS_DIR, "02_HotelLink_UseCase.puml"), "w") as f: f.write(usecase_puml)
with open(os.path.join(DIAGRAMS_DIR, "03_HotelLink_ClassDiagram.puml"), "w") as f: f.write(class_puml)
print("Saved .puml source files.")

# Generate SVGs
download_diagram("plantuml", "svg", erd_puml, "01_HotelLink_ERD.svg")
download_diagram("plantuml", "svg", usecase_puml, "02_HotelLink_UseCase.svg")
download_diagram("plantuml", "svg", class_puml, "03_HotelLink_ClassDiagram.svg")

# Generate PDFs
download_diagram("plantuml", "pdf", erd_puml, "01_HotelLink_ERD.pdf")
download_diagram("plantuml", "pdf", usecase_puml, "02_HotelLink_UseCase.pdf")
download_diagram("plantuml", "pdf", class_puml, "03_HotelLink_ClassDiagram.pdf")
