fetch('http://localhost:5000/api/hotels/2/nearby-services')
.then(async r => {
  const json = await r.json();
  console.log(JSON.stringify(json, null, 2));
})
