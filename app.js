const fields = {
  capacity: document.querySelector('#capacity'),
  current: document.querySelector('#current'),
  target: document.querySelector('#target'),
  power: document.querySelector('#power'),
  cost: document.querySelector('#cost'),
  efficiency: document.querySelector('#efficiency'),
};

const output = {
  time: document.querySelector('#time'), price: document.querySelector('#price'),
  energy: document.querySelector('#energy'), gain: document.querySelector('#gain'),
  fill: document.querySelector('#battery-fill'), batteryLabel: document.querySelector('#battery-label'),
  error: document.querySelector('#error'),
  rangeBefore: document.querySelector('#range-before'),
  rangeAfter: document.querySelector('#range-after'),
};

let rangeUnit = 'miles';

function formatTime(hours) {
  const minutes = Math.round(hours * 60);
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hrs) return `${mins} min`;
  return mins ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

function calculate() {
  const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, Number(input.value)]));
  const invalid = Object.values(values).some(Number.isNaN) || values.capacity <= 0 || values.power <= 0 || values.cost < 0 || values.efficiency <= 0;
  const badPercent = values.current < 0 || values.current > 100 || values.target < 0 || values.target > 100;
  const backwards = values.target <= values.current;

  output.fill.style.width = `${Math.max(0, Math.min(100, values.target || 0))}%`;
  output.batteryLabel.textContent = `${Math.max(0, Math.min(100, values.target || 0))}%`;

  if (invalid || badPercent || backwards) {
    output.error.textContent = backwards && !invalid && !badPercent ? 'Target charge must be higher than current charge.' : 'Enter valid values in all fields.';
    ['time', 'price', 'energy', 'gain', 'rangeBefore', 'rangeAfter'].forEach(key => output[key].textContent = '—');
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
  const unitFactor = rangeUnit === 'km' ? 1.60934 : 1;
  const unitLabel = rangeUnit === 'km' ? 'km' : 'miles';
  const beforeRange = values.capacity * values.current / 100 * values.efficiency * unitFactor;
  const afterRange = values.capacity * values.target / 100 * values.efficiency * unitFactor;
  output.rangeBefore.textContent = `${Math.round(beforeRange)} ${unitLabel}`;
  output.rangeAfter.textContent = `${Math.round(afterRange)} ${unitLabel}`;
}

Object.values(fields).forEach(field => field.addEventListener('input', calculate));
document.querySelectorAll('[data-power]').forEach(button => button.addEventListener('click', () => {
  fields.power.value = button.dataset.power;
  document.querySelectorAll('[data-power]').forEach(item => item.classList.toggle('active', item === button));
  calculate();
}));
document.querySelectorAll('[data-unit]').forEach(button => button.addEventListener('click', () => {
  rangeUnit = button.dataset.unit;
  document.querySelectorAll('[data-unit]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', active);
  });
  calculate();
}));

calculate();
