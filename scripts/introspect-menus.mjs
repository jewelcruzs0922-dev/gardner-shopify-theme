import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const endpoint = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}/graphql.json`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };
const res = await fetch(endpoint, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    query: `{
      mutation: __type(name: "Mutation") { fields { name args { name type { kind name ofType { kind name ofType { name } } } } } }
    }`
  })
});
const json = await res.json();
if (json.errors) { console.log(JSON.stringify(json.errors)); process.exit(1); }
const fields = json.data.mutation.fields.filter(f => /menu/i.test(f.name));
console.log(JSON.stringify(fields, null, 2));
