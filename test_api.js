fetch('http://localhost:5000/api/hotels/2/nearby-services')
.then(async r => console.log(r.status, (await r.text()).substring(0, 500)))
.catch(console.error)
