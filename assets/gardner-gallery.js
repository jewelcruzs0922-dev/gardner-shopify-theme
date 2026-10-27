(() => {
  const initGallery = (section) => {
    const dialog = section.querySelector('[data-gallery-dialog]');
    const stage = section.querySelector('[data-gallery-stage]');
    const slides = Array.from(section.querySelectorAll('[data-gallery-slide]'));
    const counter = section.querySelector('[data-gallery-counter]');
    const closeButton = section.querySelector('[data-gallery-close]');
    const triggers = Array.from(section.querySelectorAll('[data-gallery-index]'));

    if (!dialog || !stage || !slides.length || !counter || !closeButton) return;

    let activeIndex = 0;
    let lastTrigger = null;
    let pointerStart = null;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.hidden = slideIndex !== activeIndex;
      });
      counter.textContent = `${activeIndex + 1} / ${slides.length}`;

      const image = slides[activeIndex].querySelector('img');
      if (image) image.decode().catch(() => {});
    };

    const openDialog = (index, trigger) => {
      lastTrigger = trigger;
      showSlide(index);

      if (!dialog.open) {
        dialog.showModal();
        document.documentElement.classList.add('g-gallery-lightbox-open');
      }

      closeButton.focus({ preventScroll: true });
    };

    const closeDialog = () => {
      if (dialog.open) dialog.close();
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        openDialog(Number(trigger.dataset.galleryIndex) || 0, trigger);
      });
    });

    dialog.addEventListener('click', (event) => {
      if (event.target.closest('[data-gallery-close]')) {
        closeDialog();
        return;
      }

      if (event.target.closest('[data-gallery-prev]')) {
        showSlide(activeIndex - 1);
        return;
      }

      if (event.target.closest('[data-gallery-next]')) {
        showSlide(activeIndex + 1);
        return;
      }

      if (!event.target.closest('img') && !event.target.closest('button')) {
        closeDialog();
      }
    });

    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showSlide(activeIndex - 1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showSlide(activeIndex + 1);
      }
    });

    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('g-gallery-lightbox-open');
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    });

    stage.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button') || (event.pointerType === 'mouse' && event.button !== 0)) return;
      pointerStart = { x: event.clientX, y: event.clientY };
    });

    stage.addEventListener('pointerup', (event) => {
      if (!pointerStart) return;

      const deltaX = event.clientX - pointerStart.x;
      const deltaY = event.clientY - pointerStart.y;
      pointerStart = null;

      if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

      if (deltaX < 0) {
        showSlide(activeIndex + 1);
      } else {
        showSlide(activeIndex - 1);
      }
    });

    stage.addEventListener('pointercancel', () => {
      pointerStart = null;
    });
  };

  document.querySelectorAll('.g-gallery').forEach(initGallery);
})();
