import { Header } from '../layout/Header';

export class RootPage {
    constructor(router) {
      this.router = router;
    }

    navigateTo(path) {
      this.router.navigateTo(path);
    }

    render() {
      const app = document.getElementById('app');
      app.innerHTML = '';

      // Header
      const headerComp = new Header(this.router, {
        title: 'Frontend Study',
        showBackBtn: false
      });
      app.appendChild(headerComp.render());

      // Content
      const content = document.createElement('div');
      content.style.padding = '20px';
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.alignItems = 'center';
      content.innerHTML = `
          <nav>
            <ul style="list-style: decimal-leading-zero; padding: 0; display: flex; flex-direction: column; gap: 15px;">
              <li>
                <a href="/webrtc" id="webrtcLink">
                  WebRTC Samples (SPA)
                </a>
              </li>
            </ul>
          </nav>
      `;
      app.appendChild(content);

      document.getElementById('webrtcLink').addEventListener('click', (e) => {
        e.preventDefault();
        this.router.navigateTo('/webrtc');
      });
    }
  
    unmount() {}
}
