// personalised tips based on the user's worst categories this week

const TIPS = {
  transport: [
    'Try carpooling with classmates. Splitting a car ride by 3 cuts your transport CO₂ by 66%.',
    'Could you cycle or walk for short trips this week? Even 2 days can make a big difference.',
    'Public transport like buses and trains produce far less CO₂ per passenger than driving alone.',
    'If your family is considering a new car, an electric vehicle produces zero tailpipe emissions.',
    'Combining multiple errands into one trip reduces total driving distance significantly.',
    'Walking or cycling also improves your health, a win for you and the planet!',
  ],
  diet: [
    'Swapping one beef meal for chicken saves about 4.2 kg CO₂e. Try it this week!',
    'A fully vegan meal produces 15x less CO₂ than a beef meal. Try Meatless Monday.',
    'Buying local and seasonal produce reduces transport and cold-storage emissions.',
    'Bringing a reusable water bottle eliminates bottled water emissions entirely.',
    'Plant-based proteins like beans, lentils, and tofu have some of the lowest carbon footprints.',
    'Reducing food portions to what you actually eat also cuts waste-related emissions.',
  ],
  energy: [
    'Switching off the AC when you leave a room saves ~1.5 kg CO₂ per hour it would have run.',
    'Air-drying clothes instead of using a dryer saves 2.4 kg CO₂ per load.',
    'LED bulbs use 75% less energy than incandescent. Make sure your home has switched.',
    'Unplugging chargers and devices on standby can save up to 10% of household energy.',
    'Taking shorter showers (under 5 min) reduces both water and energy usage.',
    'Washing clothes at 30°C instead of 60°C halves the energy used per load.',
  ],
  waste: [
    'Carry a reusable bag. Each plastic bag you skip saves 33g CO₂e and reduces landfill.',
    'Composting food scraps instead of binning them cuts emissions by up to 90%.',
    'Recycling one plastic bottle saves about 80g of CO₂ compared to landfill.',
    'Buy second-hand when possible. A single fast-fashion item generates ~10 kg CO₂e.',
    'Repair electronics instead of replacing them. E-waste from a small device is ~5 kg CO₂e.',
    'Plan your meals for the week to reduce food waste. The average household wastes 30% of food.',
  ],
};

// pick one tip from each top category, then top up from the worst category
export function getPersonalisedTips(categoryTotals, count = 3) {
  const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
  const tips = [];
  const used = new Set();

  for (const [cat] of sorted) {
    for (const tip of TIPS[cat] || []) {
      if (tips.length >= count) break;
      if (!used.has(tip)) { tips.push({ category: cat, tip }); used.add(tip); break; }
    }
    if (tips.length >= count) break;
  }

  if (tips.length < count) {
    const worst = sorted[0]?.[0] || 'transport';
    for (const tip of TIPS[worst] || []) {
      if (tips.length >= count) break;
      if (!used.has(tip)) { tips.push({ category: worst, tip }); used.add(tip); }
    }
  }
  return tips;
}

// category with the highest total
export function getWorstCategory(categoryTotals) {
  return Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'transport';
}
