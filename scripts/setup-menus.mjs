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
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const cols = await gql(`{ collections(first: 50) { nodes { id handle title } } }`);
const byHandle = new Map(cols.collections.nodes.map(c => [c.handle, c]));
console.log('collections:', [...byHandle.keys()].join(', '));

function collectionItem(title, handle) {
  const c = byHandle.get(handle);
  if (!c) throw new Error(`missing collection ${handle}`);
  return { title, type: 'COLLECTION', resourceId: c.id };
}

const mainItems = [
  { title: 'Home', type: 'FRONTPAGE' },
  {
    title: 'Shop',
    type: 'HTTP',
    url: '/collections/all',
    items: [
      collectionItem('Hand Tools', 'hand-tools'),
      collectionItem('Pruning & Cutting', 'pruning-cutting'),
      collectionItem('Digging & Planting', 'digging-planting'),
      collectionItem('Watering & Irrigation', 'watering-irrigation'),
      collectionItem('Soil Care', 'soil-care'),
      collectionItem('Garden Accessories', 'garden-accessories'),
      collectionItem('Power Tools', 'power-tools')
    ]
  },
  { title: 'New Arrivals', type: 'COLLECTION', resourceId: byHandle.get('new-arrivals').id },
  { title: 'Bestsellers', type: 'COLLECTION', resourceId: byHandle.get('bestsellers').id },
  { title: 'Guides', type: 'HTTP', url: '/blogs/news' },
  { title: 'About', type: 'HTTP', url: '/pages/about' },
  { title: 'Contact', type: 'HTTP', url: '/pages/contact' }
];

const footerItems = [
  { title: 'Shop all', type: 'HTTP', url: '/collections/all' },
  { title: 'Bestsellers', type: 'COLLECTION', resourceId: byHandle.get('bestsellers').id },
  { title: 'New Arrivals', type: 'COLLECTION', resourceId: byHandle.get('new-arrivals').id },
  { title: 'Guides', type: 'HTTP', url: '/blogs/news' },
  { title: 'About', type: 'HTTP', url: '/pages/about' },
  { title: 'Contact', type: 'HTTP', url: '/pages/contact' },
  { title: 'Shipping', type: 'HTTP', url: '/pages/shipping' },
  { title: 'Returns', type: 'HTTP', url: '/pages/returns' },
  { title: 'Privacy', type: 'HTTP', url: '/pages/privacy' },
  { title: 'Terms', type: 'HTTP', url: '/pages/terms' }
];

async function upsertMenu(handle, title, items) {
  const existing = await gql(`query { menus(first: 50) { nodes { id handle title } } }`);
  const menu = existing.menus.nodes.find(m => m.handle === handle);
  if (menu) {
    const res = await gql(
      `mutation($id: ID!, $title: String!, $handle: String, $items: [MenuItemUpdateInput!]!) {
        menuUpdate(id: $id, title: $title, handle: $handle, items: $items) {
          menu { id handle title }
          userErrors { field message }
        }
      }`,
      { id: menu.id, title, handle, items }
    );
    console.log(`menuUpdate ${handle}:`, JSON.stringify(res.menuUpdate.userErrors), res.menuUpdate.menu?.id);
  } else {
    const res = await gql(
      `mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
        menuCreate(title: $title, handle: $handle, items: $items) {
          menu { id handle title }
          userErrors { field message }
        }
      }`,
      { title, handle, items }
    );
    console.log(`menuCreate ${handle}:`, JSON.stringify(res.menuCreate.userErrors), res.menuCreate.menu?.id);
  }
}

await upsertMenu('main-menu', 'Main menu', mainItems);
await upsertMenu('footer', 'Footer menu', footerItems);
