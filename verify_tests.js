async function req(path) {
  const r = await fetch('http://localhost:5000' + path);
  return r.json();
}
async function run() {
  console.log('--- TEST 1: Flash Deals & Dynamic Pricing ---');
  // Need to get room 1
  const h1 = await req('/api/hotels/1');
  const r1 = h1.data.rooms[0].id;
  
  // check in next Wed (Normal day), checkout Sat (3 nights: Wed, Thu(Peak), Fri(Peak))
  const checkIn = new Date();
  while(checkIn.getUTCDay() !== 3) checkIn.setDate(checkIn.getDate() + 1);
  const inStr = checkIn.toISOString().split('T')[0];
  
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 3);
  const outStr = checkOut.toISOString().split('T')[0];

  const preview = await req(`/api/hotels/1/price-preview?room_id=${r1}&check_in_date=${inStr}&check_out_date=${outStr}&num_rooms=1`);
  
  console.log('Flash Deal active:', preview.data.activeDeal);
  console.log('Total Price:', preview.data.totalPrice);
  console.log('Nightly Breakdown:');
  preview.data.nightlyBreakdown.forEach(n => console.log(n));

  console.log('\n--- TEST 2: Favorites & Recommendations ---');
  // I'll just check if the endpoint returns data
  const recs = await req('/api/recommendations?city_id=1&trip_type=family');
  console.log('Recommended Hotels:');
  recs.data.forEach(h => {
    console.log(`- ${h.hotel.name} (Score: ${h.recommendationScore})`);
    console.log(`  Reasons: ${h.matchReasons.join(', ')}`);
  });

  console.log('\n--- ALL TESTS COMPLETE ---');
}
run();
