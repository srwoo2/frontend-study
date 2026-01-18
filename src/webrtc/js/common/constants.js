/**
 * 전역 설정
 */
window.CONFIG = {
  connectTimeoutMs: 10000, // 10초
  iceServers: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
  wssUrl: `wss://${window.location.hostname}:3001`,
  wssCertUrl: `https://${window.location.hostname}:3001`,
};

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

// 상수를 다른 파일에서도 쉽게 접근할 수 있도록 전역 할당 (네임스페이스 유지와 편의성 사이 절충)
const CONFIG = window.CONFIG;
const CALL_STATUS = window.CALL_STATUS;
const ERRORS = window.ERRORS;
