const urls = [
  'https://www.acmetools.com/fiskars-46in-steel-d-handle-digging-shovel-396690-1001/046561196691.html',
  'https://www.dkhardware.com/dramm-drm-53-1001-9-pattern-uncarded-revolver-spray-gun-product-4059130.html',
  'https://www.acmetools.com/search?q=fiskars+powergear2+pruner'
];

const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

for (const url of urls) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': ua, Accept: 'text/html' }, redirect: 'follow' });
    const html = await res.text();
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    console.log(res.status, url.slice(0, 60), '->', m ? m[1] : 'no og:image');
  } catch (err) {
    console.log('ERR', url.slice(0, 60), err.message);
  }
}
