/**
 * SignalingService Base Class
 */
class SignalingService {
  constructor(url) {
    this.url = url;
    this.onMessage = null;
  }
  connect() {}
  send(data) {}
  close() {}
  stop() {}
}

/**
 * WebSocket Signaling Implementation
 */
class WebSocketSignaling extends SignalingService {
  constructor(url, onOpen, onClose, onError) {
    super(url);
    this.ws = null;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onError = onError;
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) return resolve();
      
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        if (this.onOpen) this.onOpen();
        resolve();
      };
      this.ws.onclose = (e) => {
        if (this.onClose) this.onClose(e);
      };
      this.ws.onerror = (e) => {
        if (this.onError) this.onError(e);
        reject(e);
      };
      this.ws.onmessage = (msg) => {
        if (this.onMessage) {
          try {
            this.onMessage(JSON.parse(msg.data));
          } catch (e) {
            console.error("Signaling parse error:", e);
          }
        }
      };
    });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  stop() {
    this.close();
  }
}

/**
 * Firebase Signaling Implementation
 */
class FirebaseSignaling extends SignalingService {
  constructor(db, roomPath) {
    super(roomPath);
    this.db = db;
    this.roomRef = window.dbRef ? window.dbRef(db, roomPath) : null;
    this.unsubs = [];
  }

  async connect() {
    // roomRef already initialized in constructor or handled here for robustness
    if (!this.roomRef && window.dbRef) {
      this.roomRef = window.dbRef(this.db, this.url);
    }
    if (!this.roomRef) return;
    
    this.stop(); 

    // 탭 닫기/네트워크 단절 시 데이터 자동 삭제 (비정상 종료 대비)
    if (window.onDisconnectDB) {
      window.onDisconnectDB(this.roomRef).remove().catch(e => console.warn('[Signaling] onDisconnect setup failed:', e));
    }

    let hasOffer = false;
    let hasAnswer = false;

    // Listen for values (offer/answer)
    const offOffer = window.onDBValue(window.dbRef(this.db, `${this.url}/offer`), (snapshot) => {
      const data = snapshot.val();
      if (this.onMessage) {
        if (data && data.type !== 'leave') {
          hasOffer = true;
          this.onMessage({ type: 'offer', offer: data });
        } else if (hasOffer || (data && data.type === 'leave')) {
          const reason = data ? data.reason : null;
          hasOffer = false;
          this.onMessage({ type: 'leave', reason }); // Offer removed or marked as leave
        }
      }
    });
    this.unsubs.push(offOffer);

    const offAnswer = window.onDBValue(window.dbRef(this.db, `${this.url}/answer`), (snapshot) => {
      const data = snapshot.val();
      if (this.onMessage) {
        if (data && data.type !== 'leave') {
          hasAnswer = true;
          this.onMessage({ type: 'answer', answer: data });
        } else if (hasAnswer || (data && data.type === 'leave')) {
          const reason = data ? data.reason : null;
          hasAnswer = false;
          this.onMessage({ type: 'leave', reason }); // Answer removed or marked as leave
        }
      }
    });
    this.unsubs.push(offAnswer);

    // Listen for candidates
    const offCaller = window.onDBChildAdded(window.dbRef(this.db, `${this.url}/callerCandidates`), (snapshot) => {
      const data = snapshot.val();
      if (data && this.onMessage) this.onMessage({ type: 'candidate', role: 'caller', candidate: data });
    });
    this.unsubs.push(offCaller);

    const offCallee = window.onDBChildAdded(window.dbRef(this.db, `${this.url}/calleeCandidates`), (snapshot) => {
      const data = snapshot.val();
      if (data && this.onMessage) this.onMessage({ type: 'candidate', role: 'callee', candidate: data });
    });
    this.unsubs.push(offCallee);
  }

  async send(data) {
    try {
      if (data.type === 'offer') {
        const offerRef = window.dbRef(this.db, `${this.url}/offer`);
        await window.setDB(offerRef, data.offer);
        // 내가 나갈 때 offer 노드를 {type: 'leave', reason: 'error'} 로 바꿔서 상대에게 비정상 종료 알림
        if (window.onDisconnectDB) {
          window.onDisconnectDB(offerRef).set({ type: 'leave', reason: 'error' });
        }
      } else if (data.type === 'answer') {
        const answerRef = window.dbRef(this.db, `${this.url}/answer`);
        await window.setDB(answerRef, data.answer);
        // 내가 나갈 때 answer 노드를 {type: 'leave', reason: 'error'} 로 바꿔서 상대에게 비정상 종료 알림
        if (window.onDisconnectDB) {
          window.onDisconnectDB(answerRef).set({ type: 'leave', reason: 'error' });
        }
      } else if (data.type === 'candidate') {
        const role = data.role === 'caller' ? 'callerCandidates' : 'calleeCandidates';
        await window.pushDB(window.dbRef(this.db, `${this.url}/${role}`), data.candidate);
      } else if (data.type === 'leave') {
        if (this.roomRef) {
          // 정상 종료 시에는 노드를 아예 삭제 (상대방에겐 null 데이터로 전달되어 hasOffer/hasAnswer 분기로 catch)
          await window.removeDB(this.roomRef);
        }
      }
    } catch (e) {
      console.error(`[Signaling] Send error (${data.type}):`, e);
      // 권한 오류 등의 경우 사용자에게 알림은 주되 크래시는 방지
      if (e.message?.includes('PERMISSION_DENIED')) {
        console.warn('Firebase permission denied. Please check your security rules.');
      }
    }
  }

  close() {
    this.stop();
    if (this.roomRef) {
      window.removeDB(this.roomRef);
    }
  }

  stop() {
    if (this.unsubs) {
      this.unsubs.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
      this.unsubs = [];
    }
  }
}

window.WebSocketSignaling = WebSocketSignaling;
window.FirebaseSignaling = FirebaseSignaling;
