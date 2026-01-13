export function createTargetToggleBtn(onTargetChange, initialTarget = '_self') {
  const btn = document.createElement('button');
  btn.id = 'targetToggleBtn';
  btn.textContent = `Target: ${initialTarget}`;
  
  let currentTarget = initialTarget;

  btn.addEventListener('click', () => {
    currentTarget = currentTarget === '_blank' ? '_self' : '_blank';
    btn.textContent = `Target: ${currentTarget}`;

    // 콜백 호출
    if (onTargetChange && typeof onTargetChange === 'function') {
      onTargetChange(currentTarget);
    }
  });

  return btn;
}

export function createLinkItem(parent, text, href, router, basePath = '/webrtc') {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.textContent = text;
  
  const targetUrl = `${basePath}?path=${encodeURIComponent(href)}`;
  a.href = targetUrl;
  a.target = '_self';
  
  a.addEventListener('click', (e) => {
    if (a.target !== '_blank') {
      e.preventDefault();
      router.navigateTo(targetUrl);
    }
  });

  li.appendChild(a);
  parent.appendChild(li);
}
