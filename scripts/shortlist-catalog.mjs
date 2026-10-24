import fs from 'node:fs';

const candidates = JSON.parse(fs.readFileSync('data/candidates.json', 'utf8'));

function pick(vendor, n, filter = () => true) {
  return candidates
    .filter(c => c.vendor === vendor && filter(c))
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    .slice(0, n);
}

const selections = [
  ...pick('FELCO', 6, c => /prun|shear|saw|lopper/i.test(c.title) && parseFloat(c.price) < 150),
  ...pick('Okatsune', 2),
  ...pick('ARS', 2, c => /prun|shear|saw/i.test(c.title)),
  ...pick('Burgon & Ball', 8, c => /trowel|fork|hoe|rake|prun|shear|kneel|glove|watering|sow|dibber/i.test(c.title) && parseFloat(c.price) < 90),
  ...pick('DeWit', 6, c => parseFloat(c.price) < 100),
  ...pick('Sneeboer', 6, c => /trowel|fork|spade|hoe|rake|sow/i.test(c.title) && parseFloat(c.price) < 160),
  ...pick('Barebones', 6, c => /garden|trowel|prun|shear|rake|hoe|harvest|forage|cultivat/i.test(`${c.title} ${c.type}`) && parseFloat(c.price) < 120),
  ...pick('Hoss', 6, c => parseFloat(c.price) < 200),
  ...pick('Dramm', 4),
  ...pick('Foxgloves', 2, c => /glove/i.test(c.title)),
  ...pick('Red Pig Garden Tools', 2),
  ...pick('Fanno Saw Works', 2)
];

console.log(`selected: ${selections.length}`);
selections.forEach((c, i) => {
  console.log(`${i + 1}. $${c.price} | ${c.vendor} | ${c.title} | ${c.type} | ${c.handle}`);
});
