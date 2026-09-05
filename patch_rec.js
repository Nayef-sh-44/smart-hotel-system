const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/recommendationController.js', 'utf8');

code = code.replace(
  `} from '../models/index.js';`,
  `, Favorite } from '../models/index.js';`
);

const oldFav = `    const scoredHotels = allHotels.map((hotel) => {
      let score = 0;
      const matchReasons = [];`;

const newFav = `    const userFavorites = req.user ? await Favorite.findAll({ where: { user_id: req.user.id } }).then(fs => fs.map(f => f.hotel_id)) : [];

    const scoredHotels = allHotels.map((hotel) => {
      let score = 0;
      const matchReasons = [];
      
      if (userFavorites.includes(hotel.id)) {
        score += 30;
        matchReasons.push('One of your Favorite Hotels');
      }`;

code = code.replace(oldFav, newFav);

fs.writeFileSync('backend/src/controllers/recommendationController.js', code);
console.log('patched recommendation');
