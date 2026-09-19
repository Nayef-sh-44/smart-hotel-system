async function test() {
    const lat = 33.5138;
    const lon = 36.2765; // Damascus
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
}
test();
