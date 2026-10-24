import fs from 'node:fs';
const c = JSON.parse(fs.readFileSync('data/candidates.json', 'utf8'));

const queries = [
  ['Burgon & Ball', /trowel|fork|pruner|weeder|kneeler|glove|watering|rake|hoe|scoop|dibber/i],
  ['Sneeboer', /trowel|fork|hoe|rake|spade|weeder|scoop/i],
  ['DeWit', /trowel|fork|hoe|cultivator|weeder|transplant|scoop|dibber/i],
  ['Barebones', /trowel|hoe|rake|pruner|shear|cultivat|harvest|spade/i],
  ['Dramm', /nozzle|watering|hose|breaker|wand|can/i],
  ['Hoss', /hoe|wheel|cultivat|trowel|fork|rake|planter/i],
  ['FELCO', /^(?!.*spare).*(prun|shear|saw|lopper)/i],
  ['Okatsune', /.*/],
  ['ARS', /.*/],
  ['Red Pig Garden Tools', /.*/],
  ['Fanno Saw Works', /.*/]
];

for (const [vendor, re] of queries) {
  console.log(`\n## ${vendor}`);
  const items = c
    .filter(x => x.vendor === vendor && re.test(`${x.title} ${x.type}`))
    .filter(x => parseFloat(x.price) >= 5 && parseFloat(x.price) <= 180)
    .filter(x => !/children|child|display|stand|sharpener|spare|replacement/i.test(x.title))
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const seen = new Set();
  let shown = 0;
  for (const x of items) {
    const key = x.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`$${x.price} | ${x.title} | ${x.type} | ${x.handle}`);
    shown += 1;
    if (shown >= 10) break;
  }
}
