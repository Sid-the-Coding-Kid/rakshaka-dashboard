const chan = '3008887';
const key = 'S23DDIFRPAD33BUT';
const url = `https://api.thingspeak.com/channels/${chan}/feeds/last.json?api_key=${key}`;

const gaugeEls = {
  temp: document.getElementById('gaugeTemp'),
  hum: document.getElementById('gaugeHum'),
  smoke: document.getElementById('gaugeSmoke'),
  ammonia: document.getElementById('gaugeAmmonia'),
};
const alertBox = document.getElementById('alertBox');

const ctxSmoke = document.getElementById('chartSmoke').getContext('2d');
const ctxAmmonia = document.getElementById('chartAmmonia').getContext('2d');

const chartSmoke = new Chart(ctxSmoke, {
  type: 'line',
  data: { labels: [], datasets: [{ label: 'Smoke', data: [], borderColor: '#ffa000', fill: false }] },
  options: { scales: { x: { display: false }, y: { min: 0, max: 1023 } } }
});
const chartAm = new Chart(ctxAmmonia, {
  type: 'line',
  data: { labels: [], datasets: [{ label: 'Ammonia', data: [], borderColor: '#c2185b', fill: false }] },
  options: { scales: { x: { display: false }, y: { min: 0, max: 1023 } } }
});

async function update() {
  try {
    const res = await fetch(url);
    const json = await res.json();
    const t = parseFloat(json.field1);
    const h = parseFloat(json.field2);
    const s = parseInt(json.field3);
    const a = parseInt(json.field4);

    gaugeEls.temp.textContent = t.toFixed(1);
    gaugeEls.hum.textContent = h.toFixed(1);
    gaugeEls.smoke.textContent = s;
    gaugeEls.ammonia.textContent = a;

    [chartSmoke, chartAm].forEach(chart => {
      const field = chart === chartSmoke ? s : a;
      chart.data.labels.push('');
      chart.data.datasets[0].data.push(field);
      if (chart.data.datasets[0].data.length > 50) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
      }
      chart.update();
    });

    if (s > 400 || a > 300) alertBox.style.display = 'block';
    else alertBox.style.display = 'none';

  } catch(e) {
    console.error(e);
  }
}

update();
setInterval(update, 15000);
