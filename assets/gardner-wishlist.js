(() => {
  const STORAGE_KEY = 'gardner:wishlist';
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.5 4.6 13a4.9 4.9 0 0 1 0-6.9 4.7 4.7 0 0 1 6.7 0l.7.7.7-.7a4.7 4.7 0 0 1 6.7 0 4.9 4.9 0 0 1 0 6.9Z"/></svg>';
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  let items = read();
  let storageWorks = true;

  function read() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((handle) => typeof handle === 'string' && handle) : [];
    } catch (error) {
      storageWorks = false;
      return [];
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      storageWorks = false;
    }
  }

  function handleFromHref(href) {
    if (!href) return '';
    const match = href.split('/products/')[1];
    return match ? match.split(/[?#]/)[0] : '';
  }

  function announce(message) {
    let region = document.getElementById('GardnerWishlistStatus');
    if (!region) {
      region = document.createElement('p');
      region.id = 'GardnerWishlistStatus';
      region.className = 'visually-hidden';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    region.textContent = message;
  }

  function sync() {
    document.querySelectorAll('[data-wishlist-toggle]').forEach((button) => {
      const saved = items.includes(button.dataset.wishlistToggle);
      button.classList.toggle('is-saved', saved);
      if (button.classList.contains('g-wishlist-toggle')) {
        button.setAttribute('aria-pressed', saved ? 'true' : 'false');
        button.title = saved ? 'Remove from wishlist' : 'Add to wishlist';
        const label = button.querySelector('.g-wishlist-toggle__label');
        if (label) {
          label.textContent = saved ? 'Saved to wishlist' : 'Add to wishlist';
          button.removeAttribute('aria-label');
        } else {
          button.setAttribute('aria-label', saved ? 'Remove from wishlist' : 'Add to wishlist');
        }
      } else {
        button.setAttribute('aria-label', 'Remove from wishlist');
      }
    });

    document.querySelectorAll('[data-wishlist-count]').forEach((badge) => {
      badge.textContent = String(items.length);
      badge.hidden = items.length === 0;
    });

    document.querySelectorAll('[data-wishlist-link]').forEach((link) => {
      link.setAttribute('aria-label', items.length ? `Wishlist, ${items.length} saved` : 'Wishlist');
    });
  }

  function toggle(handle) {
    if (!handle) return;
    const saved = items.includes(handle);
    items = saved ? items.filter((item) => item !== handle) : items.concat(handle);
    persist();
    sync();
    announce(saved ? 'Removed from wishlist' : `Saved to wishlist. ${items.length} item${items.length === 1 ? '' : 's'} saved.`);
    document.dispatchEvent(new CustomEvent('gardner:wishlist-changed', { detail: { handle, saved } }));
  }

  const processedCards = new WeakSet();

  function addToggleToCard(card) {
    if (processedCards.has(card)) return;
    processedCards.add(card);
    if (card.querySelector('[data-wishlist-toggle]')) return;
    const link = card.querySelector('.card__heading a[href*="/products/"]') || card.querySelector('a[href*="/products/"]');
    const handle = handleFromHref(link ? link.getAttribute('href') : '');
    if (!handle) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'g-wishlist-toggle';
    button.dataset.wishlistToggle = handle;
    button.innerHTML = HEART;
    card.appendChild(button);
  }

  function injectCardToggles(root = document) {
    if (root.matches?.('.card-wrapper')) addToggleToCard(root);
    root.querySelectorAll?.('.card-wrapper').forEach(addToggleToCard);
  }

  function injectProductToggle() {
    if (document.querySelector('.g-wishlist-toggle--pdp')) return;
    const handle = handleFromHref(window.location.pathname);
    if (!handle) return;
    const title = document.querySelector('.product__title');
    if (!title || !title.parentNode) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'g-wishlist-toggle g-wishlist-toggle--pdp';
    button.dataset.wishlistToggle = handle;
    button.innerHTML = `${HEART}<span class="g-wishlist-toggle__label">Add to wishlist</span>`;
    title.insertAdjacentElement('afterend', button);
  }

  function injectHeaderLink() {
    document.querySelectorAll('.header__icons').forEach((icons) => {
      if (icons.querySelector('[data-wishlist-link]')) return;
      const link = document.createElement('a');
      link.className = 'header__icon header__icon--wishlist g-wishlist-link';
      link.href = '/pages/wishlist';
      link.dataset.wishlistLink = '';
      link.setAttribute('aria-label', 'Wishlist');
      link.innerHTML = `${HEART}<span class="g-wishlist-count" data-wishlist-count hidden>0</span>`;
      const cart = icons.querySelector('.header__icon--cart');
      if (cart) {
        icons.insertBefore(link, cart);
      } else {
        icons.appendChild(link);
      }
    });
  }

  function imageUrl(url, width) {
    if (!url) return '';
    return `${url}${url.includes('?') ? '&' : '?'}width=${width}`;
  }

  function buildCard(product, handle) {
    const card = document.createElement('article');
    card.className = 'g-wishlist-card';

    const mediaLink = document.createElement('a');
    mediaLink.className = 'g-wishlist-card__media';
    mediaLink.href = product.url;
    mediaLink.tabIndex = -1;
    mediaLink.setAttribute('aria-hidden', 'true');
    if (product.featured_image) {
      const img = document.createElement('img');
      img.src = imageUrl(product.featured_image, 533);
      img.alt = '';
      img.loading = 'lazy';
      img.width = 533;
      img.height = 533;
      mediaLink.appendChild(img);
    }
    card.appendChild(mediaLink);

    const info = document.createElement('div');
    info.className = 'g-wishlist-card__info';

    const heading = document.createElement('h3');
    heading.className = 'g-wishlist-card__title';
    const titleLink = document.createElement('a');
    titleLink.href = product.url;
    titleLink.textContent = product.title;
    heading.appendChild(titleLink);

    const price = document.createElement('p');
    price.className = 'g-wishlist-card__price';
    const current = document.createElement('span');
    current.textContent = money.format(product.price / 100);
    price.appendChild(current);
    if (product.compare_at_price && product.compare_at_price > product.price) {
      const was = document.createElement('s');
      was.textContent = money.format(product.compare_at_price / 100);
      price.appendChild(was);
    }

    const meta = document.createElement('p');
    meta.className = 'g-wishlist-card__meta';
    meta.textContent = product.available ? 'In stock' : 'Sold out';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'g-wishlist-remove';
    remove.dataset.wishlistToggle = handle;
    remove.textContent = 'Remove';

    info.append(heading, price, meta, remove);
    card.appendChild(info);
    return card;
  }

  async function renderWishlistPage() {
    const grid = document.querySelector('[data-wishlist-grid]');
    if (!grid) return;
    const status = document.querySelector('[data-wishlist-status]');
    const empty = document.querySelector('[data-wishlist-empty]');
    const note = document.querySelector('[data-wishlist-note]');

    grid.setAttribute('aria-busy', 'true');
    if (status) status.hidden = false;

    const products = await Promise.all(
      items.map(async (handle) => {
        try {
          const response = await fetch(`/products/${handle}.js`, { headers: { Accept: 'application/json' } });
          if (!response.ok) return null;
          const product = await response.json();
          return { handle, product };
        } catch (error) {
          return null;
        }
      })
    );

    const valid = products.filter(Boolean);
    const missing = products.filter((entry) => !entry).length;
    if (missing) {
      items = items.filter((handle) => valid.some((entry) => entry.handle === handle));
      persist();
      sync();
    }

    grid.textContent = '';
    valid.forEach(({ handle, product }) => grid.appendChild(buildCard(product, handle)));

    const isEmpty = valid.length === 0;
    grid.hidden = isEmpty;
    if (empty) empty.hidden = !isEmpty;
    if (status) status.hidden = true;
    grid.removeAttribute('aria-busy');
    if (note) note.hidden = isEmpty;
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-wishlist-toggle]');
    if (!button) return;
    event.preventDefault();
    toggle(button.dataset.wishlistToggle);
  });

  document.addEventListener('gardner:wishlist-changed', () => {
    if (document.querySelector('[data-wishlist-grid]')) renderWishlistPage();
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    items = read();
    sync();
    if (document.querySelector('[data-wishlist-grid]')) renderWishlistPage();
  });

  function init() {
    injectHeaderLink();
    injectCardToggles();
    injectProductToggle();
    sync();
    renderWishlistPage();

    const observer = new MutationObserver((mutations) => {
      const addedCards = [];
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches?.('.card-wrapper')) {
            addedCards.push(node);
          } else if (node.querySelectorAll) {
            addedCards.push(...node.querySelectorAll('.card-wrapper'));
          }
        }
      }
      const unseen = addedCards.filter((card) => !processedCards.has(card));
      if (!unseen.length) return;
      unseen.forEach(addToggleToCard);
      sync();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
