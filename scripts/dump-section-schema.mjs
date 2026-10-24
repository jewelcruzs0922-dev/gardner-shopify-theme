import fs from 'node:fs';

for (const file of ['sections/collection-list.liquid', 'sections/multicolumn.liquid', 'sections/featured-blog.liquid']) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
  if (!m) { console.log(file, 'no schema'); continue; }
  const schema = JSON.parse(m[1]);
  console.log(`\n## ${file} :: ${schema.name}`);
  console.log('settings:', (schema.settings || []).map(s => s.id).join(', '));
  console.log('blocks:', (schema.blocks || []).map(b => b.type).join(', '));
  console.log('presets:', JSON.stringify(schema.presets || []).slice(0, 300));
}
