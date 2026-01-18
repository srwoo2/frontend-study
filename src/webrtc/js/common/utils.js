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
 * 전역 설정
 */
window.CONFIG = {
  connectTimeoutMs: 10000, // 10초
  iceServers: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
  wssUrl: `wss://${window.location.hostname}:3001`,
  wssCertUrl: `https://${window.location.hostname}:3001`,
};
const CONFIG = window.CONFIG;

/**
 * WebRTC 통화 상태를 나타내는 전역 객체
 */
window.CALL_STATUS = {
  WAITING:     { id: 'WAITING',     label: '접속' },
  IDLE:        { id: 'IDLE',        label: '대기' },
  CONNECTING:  { id: 'CONNECTING',  label: '연결중' },
  CONNECTED:   { id: 'CONNECTED',   label: '통화중' },
  DISCONNECTED:{ id: 'DISCONNECTED',label: '종료' },
  ERROR:       { id: 'ERROR',       label: '오류'},
};
const CALL_STATUS = window.CALL_STATUS;

/**
 * 에러 메시지 상수
 */
window.ERRORS = {
  // Media 장치/권한 관련
  MEDIA_PERMISSION: '카메라 권한을 확인해 주세요.',
  MEDIA_NO_CAMERA: '연결된 카메라가 없습니다.',
  MEDIA_NO_MIC: '연결된 마이크가 없습니다.',
  MEDIA_SECURE_CONTEXT: '보안 연결(HTTPS/localhost)이 아니면 카메라/마이크를 사용할 수 없습니다.',
  MEDIA_IN_USE: '장치가 이미 다른 곳에서 사용 중입니다.',

  // 시그널링/서버 관련
  SIGNAL_ERROR: '시그널링 서버 연결 오류가 발생했습니다.',
  SIGNAL_DISCONNECTED: '서버와의 연결이 예기치 않게 끊겼습니다.',
  SIGNAL_NETWORK_UNSTABLE: '네트워크 상태가 불안정하여 연결이 끊겼습니다.',

  // 통화 로직 관련
  CALL_TIMEOUT: '10초이상 연결이 안되어 종료합니다',
  CALL_PEER_LEFT: '상대방이 통화를 종료하고 나갔습니다.',
  CALL_NOT_FOUND: '연결 중인 통화가 없습니다.'
};
const ERRORS = window.ERRORS;

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
  // 전역 상태 업데이트 (HTML 파일에 정의된 setter 호출)
  if (typeof window.ws_state !== 'undefined' && typeof WS_STATUS !== 'undefined') {
    window.ws_state = WS_STATUS.ERROR.id;
  }

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

/** Firebase Bridge for non-module scripts */
window.dbRef = null;
window.onDBValue = null;
window.onDBChildAdded = null;
window.setDB = null;
window.pushDB = null;
window.removeDB = null;

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