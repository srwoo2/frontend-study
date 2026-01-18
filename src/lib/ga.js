const GA_ID = process.env.GA_MEASUREMENT_ID;

export const trackPageview = (path) => {
  if (!GA_ID || !window.gtag) return;
  
  window.gtag('config', GA_ID, {
    page_path: path,
  });
};

const initGA = () => {
  if (!GA_ID) {
    console.warn('GA_MEASUREMENT_ID is not defined');
    return;
  }

  if (window.__GA_INITIALIZED__) return;
  window.__GA_INITIALIZED__ = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => window.dataLayer.push(args);

  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
};

initGA();
