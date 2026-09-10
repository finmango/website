
// Never hard-code the key here: this repository is public, and a key committed
// to it is harvested and its quota spent by strangers within hours.
const API_KEY = process.env.GOOGLE_TRENDS_API_KEY;
if (!API_KEY) {
    console.error('Set GOOGLE_TRENDS_API_KEY in the environment before running this script.');
    process.exit(1);
}
const BASE_URL = 'https://www.googleapis.com/trends/v1beta/graph';

async function testFetch() {
    const term = 'debt';
    const region = 'US-AL';

    // Calculate 3 months ago YYYY-MM
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    const startDate = d.toISOString().slice(0, 7);

    const url = `${BASE_URL}?terms=${encodeURIComponent(term)}&restrictions.geo=${region}&restrictions.startDate=${startDate}&key=${API_KEY}`;

    console.log(`Testing URL: ${url.replace(API_KEY, 'HIDDEN_KEY')}`);

    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);

        const text = await res.text();
        console.log('Response Body:', text.slice(0, 500)); // Print first 500 chars

        if (!res.ok) {
            console.error('API Request Failed');
        } else {
            console.log('API Request Success');
        }
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

testFetch();
