import re

with open("backend/src/controllers/recommendationController.js", "r", encoding="utf-8") as f:
    code = f.read()

old_fav_logic = r"const userFavorites = req\.user \? await Favorite\.findAll\(\{ where: \{ user_id: req\.user\.id \} \}\)\.then\(fs => fs\.map\(f => f\.hotel_id\)\) : \[\];\s*const scoredHotels = allHotels\.map\(\(hotel\) => \{\s*let score = 0;\s*const matchReasons = \[\];\s*if \(userFavorites\.includes\(hotel\.id\)\) \{\s*score \+= 30;\s*matchReasons\.push\('One of your Favorite Hotels'\);\s*\}"

new_fav_logic = """
    const userFavoritesData = req.user ? await Favorite.findAll({ 
      where: { user_id: req.user.id },
      include: [{ model: Hotel, as: 'hotel', attributes: ['id', 'city_id'] }]
    }) : [];

    const calculateFavoritePreference = (hotel, userFavorites, searchRegionId) => {
      let favoriteScore = 0;
      let isFavorite = false;
      
      if (!userFavorites || userFavorites.length === 0) {
        return { favoriteScore, isFavorite };
      }

      const hotelRegion = hotel.city_id;
      
      // Condition 1: Only consider favorites in the searchRegion
      const regionalFavorites = userFavorites.filter(fav => fav.hotel && fav.hotel.city_id === searchRegionId);

      // Only apply favorite logic if the hotel belongs to the search region
      if (hotelRegion === searchRegionId && regionalFavorites.length > 0) {
        // Condition 2: Is the hotel itself a favorite?
        isFavorite = regionalFavorites.some(fav => fav.hotel_id === hotel.id);
        if (isFavorite) {
          favoriteScore += 15; // Moderate boost
        }
        
        // Condition 3: Pattern preference in the region
        if (regionalFavorites.length === 1) {
          favoriteScore += 3;
        } else if (regionalFavorites.length >= 2) {
          favoriteScore += Math.min(8, regionalFavorites.length * 2);
        }
      }

      return { favoriteScore, isFavorite };
    };

    const scoredHotels = allHotels.map((hotel) => {
      let score = 0;
      const matchReasons = [];
      
      // Determine searchRegion from the currently evaluated hotel (since allHotels is already filtered by search query)
      const searchRegionId = hotel.city_id;
      
      const { favoriteScore, isFavorite } = calculateFavoritePreference(hotel, userFavoritesData, searchRegionId);
      
      if (favoriteScore > 0) {
        score += favoriteScore;
      }
      if (isFavorite) {
        matchReasons.push('One of your Favorite Hotels');
      }
"""

code = re.sub(old_fav_logic, new_fav_logic.strip(), code, flags=re.DOTALL)

# Add debugging logs right before `return { hotel, recommendationScore... }`
return_logic = r"(return \{\s*hotel,\s*recommendationScore: Math\.round\(score\),)"
new_return_logic = """
      const finalScore = Math.round(score);
      
      // 10. Logging / Debug
      console.log(`[Recommendation DEBUG] hotelId=${hotel.id}, hotelRegion=${hotel.city_id}, searchRegion=${searchRegionId}, isFavorite=${isFavorite}, favoritePreferenceScore=${favoriteScore}, finalRecommendationScore=${finalScore}`);

      return {
        hotel,
        recommendationScore: finalScore,
"""

code = re.sub(return_logic, new_return_logic.strip(), code)

with open("backend/src/controllers/recommendationController.js", "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS")
