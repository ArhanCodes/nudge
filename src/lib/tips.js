// Personalised weekly tips based on worst-performing category.

const TIPS = {
  transport: [
    'Try carpooling with classmates — splitting a car ride by 3 cuts your transport CO₂ by 66%.',
    'Could you cycle or walk for short trips this week? Even 2 days can make a big difference.',
    'Public transport like buses and trains produce far less CO₂ per passenger than driving alone.',
    'If your family is considering a new car, an electric vehicle produces zero tailpipe emissions.',
    'Combining multiple errands into one trip reduces total driving distance significantly.',
    'Walking or cycling also improves your health — a win for you and the planet!',
  ],
  diet: [
    'Swapping one beef meal for chicken saves about 4.2 kg CO₂e. Try it this week!',
    'A fully vegan meal produces 15x less CO₂ than a beef meal — try Meatless Monday.',
    'Buying local and seasonal produce reduces transport and cold-storage emissions.',
    'Bringing a reusable water bottle eliminates bottled water emissions entirely.',
    'Plant-based proteins like beans, lentils, and tofu have some of the lowest carbon footprints.',
    'Reducing food portions to what you actually eat also cuts waste-related emissions.',
  ],
  energy: [
    'Switching off the AC when you leave a room saves ~1.5 kg CO₂ per hour it would have run.',
    'Air-drying clothes instead of using a dryer saves 2.4 kg CO₂ per load.',
    'LED bulbs use 75% less energy than incandescent — make sure your home has switched.',
    'Unplugging chargers and devices on standby can save up to 10% of household energy.',
    'Taking shorter showers (under 5 min) reduces both water and energy usage.',
    'Washing clothes at 30°C instead of 60°C halves the energy used per load.',
  ],
  waste: [
    'Carry a reusable bag — each plastic bag you skip saves 33g CO₂e and reduces landfill.',
    'Composting food scraps instead of binning them cuts emissions by up to 90%.',
    'Recycling one plastic bottle saves about 80g of CO₂ compared to landfill.',
    'Buy second-hand when possible — a single fast-fashion item generates ~10 kg CO₂e.',
    'Repair electronics instead of replacing them — e-waste from a small device is ~5 kg CO₂e.',
    'Plan your meals for the week to reduce food waste — the average household wastes 30% of food.',
  ],
};

export function getPersonalisedTips(categoryTotals, count = 3) {
  // categoryTotals: { transport: number, diet: number, energy: number, waste: number }
  const sorted = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a); // worst first

  const tips = [];
  const used = new Set();

  for (const [category] of sorted) {
    const pool = TIPS[category] || [];
    for (const tip of pool) {
      if (tips.length >= count) break;
      if (!used.has(tip)) {
        tips.push({ category, tip });
        used.add(tip);
        break; // one tip per category pass
      }
    }
    if (tips.length >= count) break;
  }

  // If we still need more, fill from worst category
  if (tips.length < count) {
    const worstCat = sorted[0]?.[0] || 'transport';
    for (const tip of TIPS[worstCat] || []) {
      if (tips.length >= count) break;
      if (!used.has(tip)) {
        tips.push({ category: worstCat, tip });
        used.add(tip);
      }
    }
  }

  return tips;
}

export function getWorstCategory(categoryTotals) {
  let worst = 'transport';
  let max = -1;
  for (const [cat, val] of Object.entries(categoryTotals)) {
    if (val > max) {
      max = val;
      worst = cat;
    }
  }
  return worst;
}
