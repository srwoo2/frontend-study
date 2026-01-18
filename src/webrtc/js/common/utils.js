/** 복사 이벤트 */
window.copyText = function(id) {
  var el = document.getElementById(id);
  if (!el) return;

  el.select();
  el.setSelectionRange(0, 999999); // 모바일 대응

  try {
    document.execCommand('copy');
  } catch (e) {
    alert('복사 중 오류: ' + e.message);
  }
}

/** 붙여넣기 이벤트 */
window.pasteText = function(id) {
  var el = document.getElementById(id);
  if (!el) return;

  // 최신 브라우저 Clipboard API
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText()
      .then(function(text) {
        el.value = text;
      });
    return;
  }

  // fallback (구형)
  alert('클립보드에서 붙여넣기 지원 안됨');
}

/** 지우기 이벤트 */
window.clearText = function(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.value = '';
}


/** LOGGING */
window.log = function(level, msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${msg}`;
  console.log(line);

  // CONFIG가 정의되어 있고 logUrl이 있는 경우에만 fetch 시도
  if (typeof window.CONFIG !== 'undefined' && window.CONFIG.logUrl) {
    fetch(window.CONFIG.logUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message: msg, timestamp })
    })
    .catch(e => console.error('[ERROR] log :', e));
  }
};

/**
 * 공통 에러 핸들러
 * @param {Error} e 에러 객체
 * @param {Function} retryAction 재시도 시 실행할 함수 (옵션)
 */
window.handleError = function(e, retryAction) {

  const msg = e.message || e;
  alert(msg);
  
  if (typeof window.log === 'function') {
    window.log('ERROR', msg);
  }

  const retryBtn = document.getElementById('retryBtn');
  if (retryBtn) {
    if (retryAction && typeof retryAction === 'function') {
      retryBtn.onclick = async () => {
        try {
          await retryAction();
        } catch (err) {
          window.handleError(err, retryAction);
        }
      };
    } else {
      if (typeof window.enterWaitingState === 'function') {
        retryBtn.onclick = window.enterWaitingState;
      }
    }
  }
};