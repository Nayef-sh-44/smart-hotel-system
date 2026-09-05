async function run() {
  let h = await fetch('http://localhost:5000/api/hotels/2').then(r => r.json());
  console.log(h.data.latitude, h.data.longitude);
}
run();
