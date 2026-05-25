import { parseItinerary } from './lib/parseItinerary';

const testText = `
== 3-Day Itinerary: Paris | May 25 - May 28 ==

--- Day 1: Historic Center ---
Location: Paris, France
Morning   -> Visit Notre-Dame Cathedral.
Afternoon -> Explore the Louvre Museum.
Evening   -> Dinner at Le Procope.
Stay: Quartier Latin

--- Day 2: Palace of Versailles ---
Location: Versailles, France
Morning   -> Head to Versailles.
Afternoon -> Tour the gardens.
Evening   -> Dinner near the estate.

--- Day 3: Giverny Gardens ---
Location: Giverny, France
Morning   -> Train to Giverny.
Afternoon -> Monet's gardens.
Evening   -> Dinner back in Paris.

== Trip Summary ==
* Estimated total cost: $300-$500 per person
* Getting around: Metro
* Book in advance: Louvre tickets
* What to pack: Walking shoes
* Local tip: Use a Navigo card.
`;

console.log('Running location parsing test...');
const res = parseItinerary(testText);
if (!res) {
  console.error('❌ Fail: parser returned null');
  process.exit(1);
}

if (res.days.length !== 3) {
  console.error(`❌ Fail: expected 3 days, got ${res.days.length}`);
  process.exit(1);
}

const expectedLocs = ['Paris, France', 'Versailles, France', 'Giverny, France'];
for (let i = 0; i < 3; i++) {
  const parsedLoc = res.days[i].location;
  const expectedLoc = expectedLocs[i];
  if (parsedLoc !== expectedLoc) {
    console.error(`❌ Fail Day ${i+1}: expected location "${expectedLoc}", got "${parsedLoc}"`);
    process.exit(1);
  }
  console.log(`✅ Day ${i+1} location parsed successfully: "${parsedLoc}"`);
}

console.log('🎉 All location parser tests passed successfully!');
