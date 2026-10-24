const stores = [
  'https://america.felco.com',
  'https://www.barebonesliving.com',
  'https://www.burgonandball.com',
  'https://www.niwaki.com',
  'https://www.hosstools.com',
  'https://www.sneeboer.com',
  'https://www.gardentoolcompany.com',
  'https://www.dewittool.com',
  'https://www.dramm.com'
];

for (const base of stores) {
  try {
    const res = await fetch(`${base}/products.json?limit=250`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' }
    });
    if (!res.ok) {
      console.log(`${base} -> HTTP ${res.status}`);
      continue;
    }
    const data = await res.json();
    const products = data.products || [];
    const prices = products.flatMap(p => p.variants.map(v => parseFloat(v.price))).filter(n => !Number.isNaN(n));
    const types = [...new Set(products.map(p => p.product_type).filter(Boolean))].slice(0, 8);
    console.log(`${base} -> ${products.length} products | ${prices.length ? Math.min(...prices).toFixed(2) + '-' + Math.max(...prices).toFixed(2) : 'n/a'} | types: ${types.join(', ')}`);
    console.log('   sample:', products.slice(0, 3).map(p => p.title).join(' | '));
  } catch (err) {
    console.log(`${base} -> ERR ${err.message}`);
  }
}
