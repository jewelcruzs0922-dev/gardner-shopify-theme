import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}

const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };
const cdn = `https://${env.SHOPIFY_STORE}/cdn/shop/t/3/assets`;

async function api(endpoint, options = {}) {
  const res = await fetch(`${base}${endpoint}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body };
}

const blogs = await api('/blogs.json?handle=news&fields=id,title,handle');
const blogId = blogs.body?.blogs?.[0]?.id;
if (!blogId) throw new Error('Guides blog not found');

const guides = [
  {
    title: 'How to clean and sharpen bypass pruners',
    handle: 'clean-sharpen-bypass-pruners',
    published_at: '2026-10-26T08:00:00-04:00',
    tags: 'Tools, Tool care',
    summary: 'A short seasonal routine that keeps blades cutting cleanly and the pivot moving freely.',
    image: `${cdn}/gardner-guide-pruner-care.jpg`,
    image_alt: 'Bypass pruners, sharpening stone, oil and gloves on a wooden potting bench',
    body_html: `
      <p>A pair of bypass pruners works hard through the season. Sap, grit, and damp storage dull the blade and stiffen the pivot long before the tool is worn out. A little cleaning and a few light passes with a file will usually bring a good pair back to a clean cut.</p>
      <h2>Clean before you sharpen</h2>
      <p>Brush off loose soil and plant debris first. If sap has hardened on the blade, wipe it with a cloth dampened in warm soapy water, then dry every surface thoroughly. A small wire brush is useful around the pivot, but keep it away from the cutting edge. Never leave the tool wet or put it away with soil still packed into the mechanism.</p>
      <h2>Work the bevel, not the flat</h2>
      <p>Most bypass pruners have a bevel on one side of the blade and a flat face on the other. Follow the existing angle with a fine diamond file, using light strokes in one direction. Three to five passes are usually enough to refresh the edge. Do not file the flat inner face, and do not try to remove a deep nick by grinding away the whole blade. Check the manufacturer’s instructions for your specific tool.</p>
      <h2>Oil the pivot and spring</h2>
      <p>Add one or two drops of a suitable tool oil to the pivot, then open and close the pruners several times so the oil works in. Wipe away the excess. A dry pivot wears faster, while too much oil attracts grit. If the tension screw is adjustable, make small changes and test the cut on a spare stem.</p>
      <h2>Store them dry and closed</h2>
      <p>Keep pruners closed and, if you have one, in a sheath. Store them somewhere dry rather than on a damp shed floor. A quick wipe after each use takes seconds and prevents most of the problems that make a tool feel blunt.</p>
      <h2>When to replace instead</h2>
      <p>A cracked handle, a pivot that will not stay tight, or a blade with a deep chip may not be worth repairing. If the blades no longer meet evenly along their length, replacement parts or a new pair may be the safer choice. Sharp, well-fitting pruners make cleaner cuts and are easier on your hands.</p>
    `
  },
  {
    title: 'A spring garden tool checklist',
    handle: 'spring-garden-tool-checklist',
    published_at: '2026-10-26T07:00:00-04:00',
    tags: 'Seasonal, Tools',
    summary: 'A practical audit for handles, blades, locks, and the small kit worth having ready before planting.',
    image: `${cdn}/gardner-guide-spring-tools.jpg`,
    image_alt: 'Hand trowel, fork, pruners, gloves, twine and seed packets arranged on canvas',
    body_html: `
      <p>The first warm weeks are much easier when the tools are already in working order. Before buying anything new, gather what you have and give each piece a quick inspection. Most spring jobs need a small, familiar kit rather than a shed full of equipment.</p>
      <h2>Lay everything out</h2>
      <p>Bring the hand tools into good light and separate them into three groups: ready to use, needs attention, and beyond repair. Check handles for cracks or splinters, blades for chips, and locks and springs for smooth movement. Look at the connection between the handle and the working head; a loose ferrule or rivet can fail under load.</p>
      <h2>Clean the working end</h2>
      <p>Remove soil, sap, and dried grass from trowels, forks, hoes, and pruners. Wash metal parts if needed, then dry them completely. A light wire brush is useful on stubborn rust, but avoid scratching the cutting edge of a sharpened tool. Wipe metal surfaces with a thin film of oil before storing them again.</p>
      <h2>Sharpen what cuts</h2>
      <p>Pruners, secateurs, and edging tools benefit from a light sharpen at the start of the season. Follow the existing bevel and use a fine file or sharpening stone. Hoes and trowels do not need a razor edge, but a clean, straight edge makes weeding and planting easier. Wear gloves and protect the blade when you are finished.</p>
      <h2>The small kit</h2>
      <ul>
        <li>Bypass pruners for live stems and light branches</li>
        <li>A hand trowel for planting and lifting seedlings</li>
        <li>A hand fork for loosening soil and lifting weeds</li>
        <li>A hoe for narrow rows and surface weeding</li>
        <li>A watering can with a rose for gentle watering</li>
        <li>Gloves, twine, plant labels, and a soft brush</li>
      </ul>
      <p>Add tools only when a real job calls for them. A second trowel or a specialist hoe is useful if you garden regularly, but it should earn its space in the shed.</p>
      <h2>Test before the rush</h2>
      <p>Open and close every lock, make a test cut on a spare stem, and check that handles feel secure in your grip. Clean the handles with a damp cloth and let them dry. A five-minute test now is better than discovering a broken lock halfway through planting.</p>
    `
  },
  {
    title: 'Choosing a hand trowel that fits the job',
    handle: 'choosing-a-hand-trowel',
    published_at: '2026-10-25T09:00:00-04:00',
    tags: 'Tools, Planting',
    summary: 'Blade shape, handle, and weight matter more than a long list of features. Here is how to choose.',
    image: `${cdn}/gardner-guide-trowel.jpg`,
    image_alt: 'Hand trowel planting a seedling in dark soil beside a raised bed',
    body_html: `
      <p>A hand trowel is one of the few tools most gardeners use every week. The right one feels balanced in the hand, moves easily through the soil, and is simple to clean. The wrong one twists the wrist, bends under pressure, or disappears into a crowded tool drawer.</p>
      <h2>Start with blade width</h2>
      <p>A wider blade moves more soil and is useful for planting bulbs, lifting young plants, and scooping compost. A narrower blade is easier to work between established plants and in tight corners. If you mostly garden in containers, a compact trowel may be all you need. For open beds, a medium-width blade is often the most versatile.</p>
      <h2>Pointed or narrow?</h2>
      <p>Pointed trowels dig into firm soil more easily and are good for general planting. A narrow, slightly curved blade works well for weeding and setting small seedlings. Some trowels have depth markings, which can be helpful when planting bulbs at a consistent level, but they are not essential.</p>
      <h2>Steel and handle</h2>
      <p>Stainless steel resists rust and is easy to wipe clean. Carbon steel can take a keener edge but needs more attention after use. Look for a strong connection between the blade and handle, with no wobble. Handles should fill your grip without being bulky; wood, rubber, and molded grips all work if the tool feels comfortable with a glove on.</p>
      <h2>Fit matters more than features</h2>
      <p>Hold the trowel as if you were planting. Your hand should sit naturally, with the blade balanced rather than tipping forward. A lighter tool is easier to use for long sessions, while a heavier one may feel more solid in stony ground. Avoid buying a set simply because it is inexpensive; one well-made trowel is usually better than three awkward ones.</p>
      <h2>Keep it working</h2>
      <p>Clean soil off the blade after use, dry it, and store it under cover. A light wipe of oil at the end of the season helps prevent rust. If the handle becomes loose or the blade bends, stop using the tool; a failed trowel can cause a sudden stumble or a cut.</p>
      <p>Choose a trowel that suits the soil you actually garden in and the size of your hands. That practical fit will matter more than any extra feature.</p>
    `
  },
  {
    title: 'Watering pots and raised beds in hot weather',
    handle: 'watering-pots-raised-beds-hot-weather',
    published_at: '2026-10-25T08:00:00-04:00',
    tags: 'Watering, Summer',
    summary: 'How to water deeply, check moisture, and keep containers steady through a hot spell.',
    image: `${cdn}/gardner-guide-watering.jpg`,
    image_alt: 'Watering can watering herbs and tomatoes in raised beds at sunset',
    body_html: `
      <p>Hot weather exposes the difference between a quick sprinkle and a proper soak. Containers and raised beds dry out quickly, especially when leaves are full and the sun is strong. The aim is to keep the root zone evenly moist without washing soil away or wasting water.</p>
      <h2>Water earlier</h2>
      <p>Early morning is usually the most efficient time to water. Soil and foliage have a chance to dry during the day, and less water is lost to evaporation. If you water in the evening, keep water on the soil rather than the leaves and avoid leaving plants wet overnight.</p>
      <h2>Check below the surface</h2>
      <p>Before reaching for the can, push a finger into the soil up to the second knuckle. If it feels damp, wait. If it is dry below the surface, water slowly until the root zone is moist rather than just darkening the top layer. A small hand fork can help you check harder ground without digging up roots.</p>
      <h2>Soak slowly</h2>
      <p>A watering can with a rose, or a hose with a gentle breaker, gives you control. Water the base of each plant, pause to let the soil absorb, then return to finish. In raised beds, water may run off the sides if you pour too quickly. Several slower passes are more useful than one fast flood.</p>
      <h2>Containers need a second look</h2>
      <p>Pots can dry much faster than garden beds, particularly smaller ones. Check them daily in hot weather and water until a little drains from the base. Empty saucers after heavy rain so roots do not sit in water. Grouping pots can create a little shade and reduce wind, but leave enough space for air to move.</p>
      <h2>Mulch and shade</h2>
      <p>A layer of compost or bark mulch over bare soil slows evaporation and keeps the surface cooler. Keep mulch clear of stems and crowns. For newly planted pots, temporary shade during the hottest part of the day can help them settle without wilting.</p>
      <h2>Watch for runoff</h2>
      <p>If water pools on the surface or runs straight down the side of a pot, the soil may be compacted or dried out. Break up the surface lightly, water in stages, and check again. Adjust the routine to your soil, plants, and local weather rather than following a fixed schedule.</p>
    `
  }
];

for (const guide of guides) {
  const existing = await api(`/articles.json?blog_id=${blogId}&handle=${encodeURIComponent(guide.handle)}&fields=id,title,handle,image`);
  if (existing.body?.articles?.length) {
    console.log('article exists:', guide.handle);
    continue;
  }

  const { image, image_alt, ...article } = guide;
  const created = await api('/articles.json', {
    method: 'POST',
    body: JSON.stringify({
      article: {
        ...article,
        blog_id: blogId,
        published: true,
        author: 'Gardner',
        summary_html: `<p>${article.summary}</p>`
      }
    })
  });

  if (created.status !== 201) {
    console.log(guide.handle, 'create failed', created.status, JSON.stringify(created.body).slice(0, 220));
    continue;
  }

  const id = created.body.article.id;
  const imageRes = await api(`/articles/${id}.json`, {
    method: 'PUT',
    body: JSON.stringify({ article: { id, image: { src: image, alt: image_alt } } })
  });
  console.log(guide.handle, 'created', id, 'image', imageRes.status);
}
