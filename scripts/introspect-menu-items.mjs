import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const endpoint = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}/graphql.json`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };

async function gql(query, variables = {}) {
  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  return (await res.json()).data;
}

for (const name of ['MenuItemCreateInput', 'MenuItemUpdateInput']) {
  const data = await gql(
    `query($n: String!) { __type(name: $n) { inputFields { name type { kind name ofType { name } } } } }`,
    { n: name }
  );
  if (!data.__type) { console.log(name, 'missing'); continue; }
  console.log(name, data.__type.inputFields.map(f => `${f.name}:${f.type.name || f.type.ofType?.name}`).join(', '));
}
