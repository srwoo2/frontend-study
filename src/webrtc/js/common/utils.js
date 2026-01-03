/**
 * 새 탭 열기
 * @param {string} url 
 */
window.openTab = function(url) {
  window.open(url, "_blank");
};

/**
 * 복사 이벤트
 */
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

/**
 * 붙여넣기 이벤트
 */
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

/**
 * 지우기 이벤트
 */
window.clearText = function(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.value = '';
}

/**
 * WebRTC 통화 상태를 나타내는 전역 객체
 */
const WS_STATUS = {
  IDLE:        { id: 'IDLE',        label: '접속' },
  WAITING:     { id: 'WAITING',     label: '대기' },
  CONNECTING:  { id: 'CONNECTING',  label: '연결중' },
  CONNECTED:   { id: 'CONNECTED',   label: '통화중' },
  DISCONNECTED:{ id: 'DISCONNECTED',label: '종료' },
  ERROR:       { id: 'ERROR',       label: '오류'},
};

/** LOGGING */
window.log = function(level, msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${msg}`;
  console.log(line);

  fetch(CONFIG.logUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level, message: msg, timestamp })
  })
  .catch(e => console.error('[ERROR] log :', e));
};