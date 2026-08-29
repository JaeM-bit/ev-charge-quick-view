const fields = {
  capacity: document.querySelector('#capacity'),
  current: document.querySelector('#current'),
  target: document.querySelector('#target'),
  power: document.querySelector('#power'),
  cost: document.querySelector('#cost'),
  efficiency: document.querySelector('#efficiency'),
  metricEfficiency: document.querySelector('#metric-efficiency'),
};

const output = {
  time: document.querySelector('#time'), price: document.querySelector('#price'),
  energy: document.querySelector('#energy'), gain: document.querySelector('#gain'),
  fill: document.querySelector('#battery-fill'), batteryLabel: document.querySelector('#battery-label'),
  error: document.querySelector('#error'),
  rangeBefore: document.querySelector('#range-before'),
  rangeAfter: document.querySelector('#range-after'),
  rangeBeforeKm: document.querySelector('#range-before-km'),
  rangeAfterKm: document.querySelector('#range-after-km'),
};

function formatTime(hours) {
  const minutes = Math.round(hours * 60);
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hrs) return `${mins} min`;
  return mins ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

function calculate() {
  const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, Number(input.value)]));
  const invalid = Object.values(values).some(Number.isNaN) || values.capacity <= 0 || values.power <= 0 || values.cost < 0 || values.efficiency <= 0 || values.metricEfficiency <= 0;
  const badPercent = values.current < 0 || values.current > 100 || values.target < 0 || values.target > 100;
  const backwards = values.target <= values.current;

  output.fill.style.width = `${Math.max(0, Math.min(100, values.target || 0))}%`;
  output.batteryLabel.textContent = `${Math.max(0, Math.min(100, values.target || 0))}%`;

  if (invalid || badPercent || backwards) {
    output.error.textContent = backwards && !invalid && !badPercent ? 'Target charge must be higher than current charge.' : 'Enter valid values in all fields.';
    ['time', 'price', 'energy', 'gain', 'rangeBefore', 'rangeAfter', 'rangeBeforeKm', 'rangeAfterKm'].forEach(key => output[key].textContent = '—');
    return;
  }

  output.error.textContent = '';
  const gain = values.target - values.current;
  const energy = values.capacity * gain / 100;
  const hours = energy / values.power;
  const price = energy * values.cost / 100;
  output.time.textContent = formatTime(hours);
  output.price.textContent = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
  output.energy.textContent = `${energy.toFixed(1)} kWh`;
  output.gain.textContent = `${gain}%`;
  const beforeEnergy = values.capacity * values.current / 100;
  const afterEnergy = values.capacity * values.target / 100;
  output.rangeBefore.textContent = `${Math.round(beforeEnergy * values.efficiency)} miles`;
  output.rangeAfter.textContent = `${Math.round(afterEnergy * values.efficiency)} miles`;
  output.rangeBeforeKm.textContent = `${Math.round(beforeEnergy * 100 / values.metricEfficiency)} km`;
  output.rangeAfterKm.textContent = `${Math.round(afterEnergy * 100 / values.metricEfficiency)} km`;
}

Object.entries(fields).forEach(([key, field]) => {
  if (key !== 'efficiency' && key !== 'metricEfficiency') field.addEventListener('input', calculate);
});
function syncFromImperial() {
  const milesPerKwh = Number(fields.efficiency.value);
  fields.metricEfficiency.value = milesPerKwh > 0 ? (100 / (milesPerKwh * 1.60934)).toFixed(2) : '';
  calculate();
}

function syncFromMetric() {
  const kwhPer100km = Number(fields.metricEfficiency.value);
  fields.efficiency.value = kwhPer100km > 0 ? ((100 / kwhPer100km) * 0.62137).toFixed(2) : '';
  calculate();
}

fields.efficiency.addEventListener('input', syncFromImperial);
fields.efficiency.addEventListener('change', syncFromImperial);
fields.metricEfficiency.addEventListener('input', syncFromMetric);
fields.metricEfficiency.addEventListener('change', syncFromMetric);
document.querySelectorAll('[data-power]').forEach(button => button.addEventListener('click', () => {
  fields.power.value = button.dataset.power;
  document.querySelectorAll('[data-power]').forEach(item => item.classList.toggle('active', item === button));
  calculate();
}));
calculate();
