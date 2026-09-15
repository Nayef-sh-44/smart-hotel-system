import re

with open('backend/src/controllers/recommendationController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace from:
# const calculateFavoritePreference = (hotel, userFavorites, searchRegionId) => {
# to the end of the map function:
#     });

start_marker = "const calculateFavoritePreference = (hotel, userFavorites, searchRegionId) => {"
end_marker = "    // Sort by recommendationScore DESC"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_logic = '''
    const scoredHotels = allHotels.map((hotel) => {
      const matchReasons = [];
      
      // 1. Budget Alignment (30%)
      let budgetScore = 100;
      if (targetBudgetUsd) {
        const basePriceUsd = Number(hotel.base_price_per_night || 200);
        const diffRatio = Math.abs(basePriceUsd - targetBudgetUsd) / targetBudgetUsd;
        budgetScore = Math.max(0, 100 - (diffRatio * 100));
        if (budgetScore >= 85) {
          matchReasons.push('Great match for your target budget');
        }
      }

      // 2. Rating (25%)
      const starRating = Number(hotel.star_rating || 3);
      let avgOverall = starRating;
      let avgLocation = 4.0; // Default location rating

      if (hotel.reviews && hotel.reviews.length > 0) {
        const sumOverall = hotel.reviews.reduce((acc, r) => acc + Number(r.overall_rating || 5), 0);
        const sumLocation = hotel.reviews.reduce((acc, r) => acc + Number(r.location_rating || 4), 0);
        avgOverall = sumOverall / hotel.reviews.length;
        avgLocation = sumLocation / hotel.reviews.length;
      }

      const ratingScore = ((starRating + avgOverall) / 2 / 5) * 100;
      if (ratingScore >= 90) {
        matchReasons.push('Exceptional guest rating');
      }

      // 3. Services/Amenities (20%)
      let servicesScore = 100;
      const hotelAmenityIds = (hotel.amenities || []).map((a) => a.id);
      if (userAmenityIds.length > 0) {
        const matched = userAmenityIds.filter(id => hotelAmenityIds.includes(id)).length;
        servicesScore = (matched / userAmenityIds.length) * 100;
        if (servicesScore >= 100) {
          matchReasons.push('Includes your preferred amenities');
        }
      } else {
        servicesScore = Math.min(100, (hotelAmenityIds.length / 10) * 100);
      }

      // 4. Location (15%)
      const locationScore = (avgLocation / 5) * 100;
      if (locationScore >= 90) {
        matchReasons.push('Highly rated location');
      }

      // 5. Favorites (10%)
      const isFavorite = userFavoritesData.some(fav => fav.hotel_id === hotel.id);
      const favoritesScore = isFavorite ? 100 : 0;
      if (isFavorite) {
        matchReasons.push('One of your Favorite Hotels');
      }

      // Final Weighted Score Calculation
      const finalScoreRaw = 
        (budgetScore * 0.30) + 
        (ratingScore * 0.25) + 
        (servicesScore * 0.20) + 
        (locationScore * 0.15) + 
        (favoritesScore * 0.10);

      const finalScore = Math.round(finalScoreRaw);
      
      return {
        hotel,
        recommendationScore: finalScore,
        recommendationMatchPercentage: finalScore, // Expose directly as exactly 0-100
        matchReasons: matchReasons.length > 0 ? matchReasons : ['Recommended for overall quality & comfort'],
      };
    });

'''
    updated_content = content[:start_idx] + new_logic + content[end_idx:]
    with open('backend/src/controllers/recommendationController.js', 'w', encoding='utf-8') as f:
        f.write(updated_content)
    print("Patched successfully.")
else:
    print("Markers not found.")
