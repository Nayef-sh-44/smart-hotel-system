async function test() {
    const lat = 33.5138;
    const lon = 36.2765;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(data.daily.time.length);
    console.log(data.daily.time);
}
test();
