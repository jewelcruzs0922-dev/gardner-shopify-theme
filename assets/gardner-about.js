(() => {
  if (customElements.get('about-approach')) return;

  class AboutApproach extends HTMLElement {
    connectedCallback() {
      if (this.dataset.initialized === 'true') return;

      this.tabs = Array.from(this.querySelectorAll('[data-approach-tab]'));
      this.panels = Array.from(this.querySelectorAll('[data-approach-panel]'));
      this.progress = this.querySelector('[data-approach-progress]');

      if (!this.tabs.length || !this.panels.length) return;

      this.dataset.initialized = 'true';
      this.select(0, false);
      this.addEventListener('click', this.onClick);
      this.addEventListener('keydown', this.onKeyDown);
    }

    onClick(event) {
      const tab = event.target.closest('[data-approach-tab]');

      if (tab) {
        this.select(Number(tab.dataset.approachTab), false);
        return;
      }

      if (event.target.closest('[data-approach-prev]')) {
        this.select(this.activeIndex - 1, true);
        return;
      }

      if (event.target.closest('[data-approach-next]')) {
        this.select(this.activeIndex + 1, true);
      }
    }

    onKeyDown(event) {
      const tab = event.target.closest('[data-approach-tab]');
      if (!tab) return;

      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;

      event.preventDefault();

      if (event.key === 'Home') {
        this.select(0, true);
      } else if (event.key === 'End') {
        this.select(this.tabs.length - 1, true);
      } else {
        this.select(this.activeIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
      }
    }

    select(index, moveFocus) {
      const count = this.tabs.length;
      if (!count) return;

      this.activeIndex = ((index % count) + count) % count;

      this.tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === this.activeIndex;
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.tabIndex = isActive ? 0 : -1;
      });

      this.panels.forEach((panel, panelIndex) => {
        panel.hidden = panelIndex !== this.activeIndex;
      });

      if (this.progress) {
        const percent = this.activeIndex === count - 1
          ? 100
          : ((this.activeIndex + 0.5) / count) * 100;
        this.progress.style.width = `${percent}%`;
      }

      if (moveFocus) {
        this.tabs[this.activeIndex].focus({ preventScroll: true });
      }
    }
  }

  customElements.define('about-approach', AboutApproach);
})();
