/**
 * 네이티브 웹뷰 브릿지
 * 웹 → 앱으로 웹뷰 종료 신호 전송
 */
window.closeHandler = function() {
  console.log('[Bridge] closeHandler called');

  // Android
  if (window.Android && window.Android.closeHandler) {
    window.Android.closeHandler();
    return;
  }

  // iOS WKWebView
  if (window.webkit?.messageHandlers?.closeHandler) {
    window.webkit.messageHandlers.closeHandler.postMessage(null);
    return;
  }

  window.location.href = 'about:blank';
  window.close();
};

/**
 * 네이티브 웹뷰 브릿지
 * 앱 → 웹으로 통화 신호 전송
 * @param {string} type - 'start' | 'accept' | 'end'
 */
window.handleCallEvent = function(type) {
  console.log('[Bridge] handleCallEvent received:', type);

  switch (type) {
    case 'start':
      console.log("통화 시작 시도...");
      if (typeof window.startCall === 'function') {
        window.startCall();
      } else {
        console.warn('[Bridge] startCall function not found');
      }
      break;

    case 'accept':
      console.log("통화 수락됨");
      if (typeof window.receiveCall === 'function') {
        window.receiveCall();
      } else {
        console.warn('[Bridge] receiveCall function not found');
      }
      break;

    case 'end':
      console.log("통화 종료/거절");
      if (typeof window.endCall === 'function') {
        window.endCall();
      } else {
        console.warn('[Bridge] endCall function not found');
      }
      break;

    default:
      console.warn('[Bridge] Unknown type:', type);
  }
};
