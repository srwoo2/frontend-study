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

/**
 * 에러 메시지 상수
 */
const ERRORS = {
  CAMERA_PERMISSION: '카메라 권한을 확인해 주세요.',
  MIC_PERMISSION: '마이크 권한을 확인해 주세요.',
  NO_CAMERA: '연결된 카메라가 없습니다.',
  NO_MIC: '연결된 마이크가 없습니다.',
  WS_ERROR: 'WebSocket Error\n서버가 실행 중인지, 혹은 인증서 허용(wss)이 되었는지 확인해 주세요.',
  CONNECTION_TIMEOUT: '10초이상 연결이 안되어 종료합니다',
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

/**
 * 공통 에러 핸들러
 * @param {Error} e 에러 객체
 * @param {Function} retryAction 재시도 시 실행할 함수 (옵션)
 */
window.handleError = function(e, retryAction) {
  // 전역 상태 업데이트 (HTML 파일에 정의된 setter 호출)
  if (typeof window.ws_state !== 'undefined' && typeof WS_STATUS !== 'undefined') {
    window.ws_state = WS_STATUS.ERROR.id;
  }

  const msg = e.message || e;
  alert(msg);
  
  if (typeof log === 'function') {
    log('ERROR', msg);
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