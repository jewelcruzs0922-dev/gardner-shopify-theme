import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };

async function api(endpoint, options = {}) {
  const res = await fetch(`${base}${endpoint}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body };
}

const draftBanner = '<p><em>Draft template for a portfolio demonstration. This is not legal advice and is not a final business policy. The store owner must review and complete it before any real use.</em></p>';

const pages = [
  {
    title: 'About Gardner',
    handle: 'about',
    body_html: `<p>Gardner is a demonstration garden-tools storefront built to show a warm, practical shopping experience for everyday gardeners.</p><p>We focus on tools that are easy to understand, comfortable to use, and priced sensibly — from a first trowel to a full season of pruning and planting.</p><p>This store is a portfolio project, not a live business. Products, prices, and availability are for demonstration.</p>`
  },
  {
    title: 'Contact',
    handle: 'contact',
    template_suffix: 'contact',
    body_html: `<p>Questions about an order or a tool? Send us a message using the form, and we will get back to you.</p><p><em>Demo storefront: support contact details are placeholders and must be confirmed by the owner before launch.</em></p>`
  },
  {
    title: 'Shipping',
    handle: 'shipping',
    body_html: `${draftBanner}<h2>Processing</h2><p>Order processing times will be confirmed by the store owner.</p><h2>Rates and delivery</h2><p>Shipping rates, carriers, and delivery estimates will be configured in Shopify shipping settings before launch.</p><h2>Tracking</h2><p>Tracking details will be sent when an order ships.</p>`
  },
  {
    title: 'Returns',
    handle: 'returns',
    body_html: `${draftBanner}<h2>Return window</h2><p>The return window and eligibility rules must be confirmed by the store owner.</p><h2>Condition</h2><p>Unused items in original packaging are expected for a return; final conditions are to be confirmed.</p><h2>How to start a return</h2><p>A returns contact method and address must be added by the owner.</p>`
  },
  {
    title: 'Privacy',
    handle: 'privacy',
    body_html: `${draftBanner}<h2>What we collect</h2><p>This demo store uses Shopify-native checkout and newsletter signup. Data practices must be reviewed and completed by the owner.</p><h2>Your choices</h2><p>Contact and data-request details must be added by the owner.</p>`
  }
];

for (const page of pages) {
  const existing = await api(`/pages.json?handle=${encodeURIComponent(page.handle)}&fields=id,title`);
  if (existing.body?.pages?.length) {
    console.log('page exists:', page.handle);
    continue;
  }
  const created = await api('/pages.json', {
    method: 'POST',
    body: JSON.stringify({ page: { ...page, published: true } })
  });
  console.log('page', page.handle, '->', created.status, created.status === 201 ? created.body.page.id : JSON.stringify(created.body).slice(0, 160));
}

// Blog + articles
let blogId = null;
const blogs = await api('/blogs.json?handle=news&fields=id,title,handle');
if (blogs.body?.blogs?.length) {
  blogId = blogs.body.blogs[0].id;
  console.log('blog exists:', blogId);
} else {
  const created = await api('/blogs.json', { method: 'POST', body: JSON.stringify({ blog: { title: 'Guides', handle: 'news' } }) });
  blogId = created.body?.blog?.id;
  console.log('blog created:', blogId, created.status);
}

const articles = [
  {
    title: 'A simple seasonal garden checklist',
    handle: 'seasonal-garden-checklist',
    summary: 'A calm, practical way to plan the garden year without overbuying or overplanting.',
    body_html: '<p>Gardening gets easier when the year is broken into small jobs instead of one long list.</p><h2>Start with what you have</h2><p>Walk the garden and note light, water, and soil. Choose plants that suit those conditions rather than fighting them.</p><h2>Buy fewer, better tools</h2><p>A trowel, hand fork, pruner, and watering can cover most small gardens. Add tools when a real job calls for them.</p><h2>Work in short sessions</h2><p>Twenty focused minutes of weeding and watering beats an exhausting weekend. Little and often keeps beds tidy and plants healthy.</p>'
  },
  {
    title: 'Choosing your first pruning shears',
    handle: 'choosing-pruning-shears',
    summary: 'Bypass or anvil, budget or premium — what actually matters for a first pair of pruners.',
    body_html: '<p>Most gardeners only need one good pair of bypass pruners to start.</p><h2>Bypass first</h2><p>Bypass pruners cut like scissors and make clean cuts on living stems. Anvil pruners crush growth and are better for dead wood.</p><h2>Fit and feel</h2><p>Look for a handle that fits your hand, a lock you can use with gloves, and a blade you can sharpen or replace.</p><h2>Care</h2><p>Clean sap off the blade, dry the tool after use, and sharpen lightly each season. Good pruners last for years.</p>'
  },
  {
    title: 'Watering deeply, not often',
    handle: 'watering-deeply',
    summary: 'Why fewer, deeper waterings usually beat daily sprinkling.',
    body_html: '<p>Shallow daily watering keeps roots near the surface. Deeper, less frequent watering encourages stronger roots.</p><h2>Check before watering</h2><p>Push a finger into the soil. If it is damp below the surface, wait.</p><h2>Water at the base</h2><p>Soak the root zone slowly and let it settle. Avoid wetting leaves in the evening.</p><h2>Use the right tool</h2><p>A watering can with a rose or a gentle hose breaker gives control without washing soil away.</p>'
  }
];

for (const a of articles) {
  const existing = await api(`/articles.json?blog_id=${blogId}&handle=${encodeURIComponent(a.handle)}&fields=id,title`);
  if (existing.body?.articles?.length) {
    console.log('article exists:', a.handle);
    continue;
  }
  const created = await api('/articles.json', {
    method: 'POST',
    body: JSON.stringify({ article: { ...a, blog_id: blogId, published: true, author: 'Gardner' } })
  });
  console.log('article', a.handle, '->', created.status, created.status === 201 ? created.body.article.id : JSON.stringify(created.body).slice(0, 160));
}
