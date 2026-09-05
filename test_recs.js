async function run() {
  // Try to register
  await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ first_name: 'Test', last_name: 'User', email: 'test_favs@example.com', password: 'password123', phone: '123456789' })
  });

  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_favs@example.com', password: 'password123' })
  }).then(r => r.json());
  
  const token = loginRes.data.token;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  
  const favRes = await fetch('http://localhost:5000/api/favorites', { headers }).then(r => r.json());
  console.log("Current Favorites:", favRes.data);
  
  if (favRes.data) {
    for (let f of favRes.data) {
      await fetch(`http://localhost:5000/api/favorites/${f.id}`, { method: 'DELETE', headers });
    }
  }
  
  // Damascus hotel (id 1)
  await fetch('http://localhost:5000/api/favorites', { method: 'POST', headers, body: JSON.stringify({ hotel_id: 1 }) });
  
  // Aleppo hotel (id 11) - let's assume 11 is outside
  await fetch('http://localhost:5000/api/favorites', { method: 'POST', headers, body: JSON.stringify({ hotel_id: 11 }) });

  console.log("\n=== Test 1: Search City 1 (Damascus) ===");
  let rec1 = await fetch('http://localhost:5000/api/recommendations?city_id=1', { headers }).then(r => r.json());
  console.log("City 1 Recs:", rec1.data.map(d => ({id: d.hotel.id, score: d.recommendationScore, reasons: d.matchReasons})));
  
  console.log("\n=== Test 2: Search City 2 ===");
  let rec2 = await fetch('http://localhost:5000/api/recommendations?city_id=2', { headers }).then(r => r.json());
  console.log("City 2 Recs:", rec2.data.map(d => ({id: d.hotel.id, score: d.recommendationScore, reasons: d.matchReasons})));
  
  console.log("\n=== Test 3: Unauthenticated ===");
  let rec3 = await fetch('http://localhost:5000/api/recommendations?city_id=1').then(r => r.json());
  console.log("Unauth Recs:", rec3.data.map(d => ({id: d.hotel.id, score: d.recommendationScore, reasons: d.matchReasons})));
}

run().catch(console.error);
