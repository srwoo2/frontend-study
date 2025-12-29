export class Header {
  constructor(router, options = {}) {
    this.router = router;
    this.title = options.title || 'WebRTC Samples';
    this.showBackBtn = options.showBackBtn ?? true;
    this.backPath = options.backPath || '/';
    this.onBack = options.onBack || null;
  }

  render() {
    const header = document.createElement('header');
    header.className = 'main-header';

    const leftSection = document.createElement('div');
    leftSection.className = 'header-left';

    if (this.showBackBtn) {
      const backBtn = document.createElement('button');
      backBtn.className = 'header-back-btn';
      backBtn.textContent = '←';
      backBtn.addEventListener('click', () => {
        if (this.onBack) {
          this.onBack();
        } else {
          this.router.navigateTo(this.backPath);
        }
      });
      leftSection.appendChild(backBtn);
    }

    const titleEl = document.createElement('h1');
    titleEl.className = 'header-title';
    titleEl.textContent = this.title;
    leftSection.appendChild(titleEl);

    header.appendChild(leftSection);

    // Optional right section (for Home or other info)
    const rightSection = document.createElement('div');
    rightSection.className = 'header-right';
    
    if (window.location.pathname !== '/') {
        const homeLink = document.createElement('a');
        homeLink.href = '/';
        homeLink.textContent = 'Home';
        homeLink.className = 'header-home-link';
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.router.navigateTo('/');
        });
        rightSection.appendChild(homeLink);
    }

    header.appendChild(rightSection);

    return header;
  }
}
