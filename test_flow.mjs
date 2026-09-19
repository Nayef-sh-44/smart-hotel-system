async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/hotels/1');
        const json = await res.json();
        console.log("Hotel 1 City Data:");
        console.log(JSON.stringify(json.data.city, null, 2));
    } catch(e) {
        console.error("Fetch failed:", e);
    }
}
test();
