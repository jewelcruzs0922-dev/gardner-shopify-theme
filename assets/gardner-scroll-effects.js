(() => {
  const body = document.body;
  if (!body.classList.contains('g-scroll')) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const main = document.getElementById('MainContent');
  if (!main) return;

  const hero = main.querySelector('.g-hero');

  const staggerSelectors = [
    ['.product-grid', ':scope > .grid__item'],
    ['[data-wishlist-grid]', ':scope > *'],
    ['.collection-list', ':scope > .collection-list__item'],
    ['.gardner-home-guides__grid', ':scope > .gardner-home-guides__item'],
    ['.gardner-why__benefits', ':scope > .gardner-why__item'],
    ['.g-story__grid', ':scope > .g-story__media, :scope > .g-story__content'],
    ['.g-blog__grid', ':scope > .g-blog__card'],
    ['.g-about-hero__cards', ':scope > .g-about-card'],
    ['.g-about-features__grid', ':scope > .g-about-feature'],
    ['.g-about-trust__grid', ':scope > .g-about-trust__item'],
    ['.g-about-journal__grid', ':scope > .g-about-article'],
    ['.g-contact-hero__cards', ':scope > .g-contact-support'],
    ['.g-contact-faq__column', ':scope > .g-contact-faq__item'],
  ];

  const isAtOrAboveViewport = (element) => element.getBoundingClientRect().top < window.innerHeight;

  const flowObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('g-flow--in');
        flowObserver.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  );

  const groupObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('g-stagger--in');
        groupObserver.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.04 }
  );

  const applyStagger = (container, itemSelector) => {
    if (container.classList.contains('g-stagger')) return;

    const items = Array.from(container.querySelectorAll(itemSelector));
    if (!items.length) return;

    container.classList.add('g-stagger');
    items.forEach((item, index) => {
      item.classList.add('g-stagger__item');
      item.style.setProperty('--g-stagger-index', Math.min(index, 8));
    });

    if (isAtOrAboveViewport(container)) {
      window.requestAnimationFrame(() => container.classList.add('g-stagger--in'));
    } else {
      groupObserver.observe(container);
    }
  };

  const initStaggers = () => {
    staggerSelectors.forEach(([containerSelector, itemSelector]) => {
      main.querySelectorAll(containerSelector).forEach((container) => applyStagger(container, itemSelector));
    });
  };

  const flowSelector = 'h1, h2, h3, h4, h5, h6, p, .button, img, .g-hero__logo, .g-eyebrow';
  const isExcludedFromFlow = (element) =>
    Boolean(element.closest('.g-hero, .g-stagger, .g-gallery__track, media-gallery'));

  const initFlowGroup = (group) => {
    if (group.classList.contains('g-flow')) return;

    const items = Array.from(group.querySelectorAll(flowSelector)).filter(
      (element) => !isExcludedFromFlow(element)
    );

    if (!items.length) return;

    group.classList.add('g-flow');
    items.forEach((item, index) => {
      item.classList.add('g-flow__item');
      item.style.setProperty('--g-flow-index', Math.min(index, 8));
    });

    if (isAtOrAboveViewport(group)) {
      window.requestAnimationFrame(() => group.classList.add('g-flow--in'));
    } else {
      flowObserver.observe(group);
    }
  };

  const getFlowGroups = (section) => {
    const nested = Array.from(section.querySelectorAll('section')).filter(
      (element) =>
        !element.classList.contains('shopify-section') &&
        !element.parentElement.closest('section:not(.shopify-section)')
    );

    return nested.length > 1 ? nested : [section];
  };

  const initFlowSections = () => {
    Array.from(main.children)
      .filter((element) => element.classList.contains('shopify-section'))
      .forEach((section) => getFlowGroups(section).forEach(initFlowGroup));
  };

  initStaggers();

  const wishlistGrid = main.querySelector('[data-wishlist-grid]');
  if (wishlistGrid) {
    const applyWishlistStagger = () => {
      applyStagger(wishlistGrid, ':scope > *');
      if (wishlistGrid.children.length) wishlistGrid.classList.add('g-stagger--in');
    };

    new MutationObserver(applyWishlistStagger).observe(wishlistGrid, { childList: true });
    applyWishlistStagger();
  }

  initFlowSections();

  body.classList.add('g-scroll-ready');

  let dynamicFrame = 0;
  const initDynamicContent = () => {
    if (dynamicFrame) return;
    dynamicFrame = window.requestAnimationFrame(() => {
      dynamicFrame = 0;
      initStaggers();
      initFlowSections();
    });
  };

  new MutationObserver(initDynamicContent).observe(main, { childList: true, subtree: true });

  const gallery = main.querySelector('.g-gallery');
  let galleryAnimations = [];
  let lastScrollY = window.scrollY;
  let lastScrollTime = performance.now();
  let targetRate = 1;
  let currentRate = 1;
  let galleryFrame = 0;
  let scrollFrame = 0;

  const initGallery = () => {
    if (!gallery || window.matchMedia('(max-width: 749px)').matches) {
      galleryAnimations = [];
      return;
    }

    galleryAnimations = Array.from(gallery.querySelectorAll('.g-gallery__track')).flatMap((track) =>
      track.getAnimations()
    );
  };

  const tickGallery = () => {
    galleryFrame = 0;
    currentRate += (targetRate - currentRate) * 0.2;
    targetRate += (1 - targetRate) * 0.035;

    galleryAnimations.forEach((animation) => {
      if (animation.playState === 'running') animation.playbackRate = currentRate;
    });

    if (Math.abs(currentRate - 1) > 0.01 || Math.abs(targetRate - 1) > 0.01) {
      galleryFrame = window.requestAnimationFrame(tickGallery);
    } else {
      currentRate = 1;
      targetRate = 1;
    }
  };

  const updateScrollEffects = () => {
    scrollFrame = 0;

    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
    const shift = progress * 56;

    hero.style.setProperty('--g-hero-shift', `${shift.toFixed(2)}px`);
    hero.style.setProperty('--g-hero-content-shift', `${(-progress * 24).toFixed(2)}px`);
  };

  const onScroll = () => {
    const now = performance.now();
    const elapsed = Math.max(now - lastScrollTime, 16);
    const velocity = Math.abs(window.scrollY - lastScrollY) / elapsed;

    targetRate = 1 + Math.min(velocity * 1.6, 4);
    lastScrollY = window.scrollY;
    lastScrollTime = now;

    if (galleryAnimations.length && !galleryFrame) galleryFrame = window.requestAnimationFrame(tickGallery);
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollEffects);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    initGallery();
    onScroll();
  }, { passive: true });

  initGallery();
  updateScrollEffects();
})();
