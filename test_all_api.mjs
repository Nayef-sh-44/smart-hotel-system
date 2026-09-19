async function test() {
    for(let i=1; i<=20; i++) {
        try {
            const res = await fetch(`http://localhost:5000/api/hotels/${i}`);
            const json = await res.json();
            if(json.data && json.data.city) {
                console.log(`[Hotel ${i}] City: ${json.data.city.name} -> ${json.data.city.best_visit_months}`);
            }
        } catch(e) {}
    }
}
test();
