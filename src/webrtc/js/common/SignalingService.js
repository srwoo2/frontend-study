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
}

/**
 * Firebase Signaling Implementation
 */
class FirebaseSignaling extends SignalingService {
  constructor(db, roomPath) {
    super(roomPath);
    this.db = db;
    this.roomRef = null;
    this.firebase = null; // Should be passed or initialized
  }

  async connect() {
    // Import from CDN if not present or assume firebase/database is available
    this.roomRef = window.dbRef(this.db, this.url);
    
    // Listen for values (offer/answer)
    window.onDBValue(window.dbRef(this.db, `${this.url}/offer`), (snapshot) => {
      const data = snapshot.val();
      if (data && this.onMessage) this.onMessage({ type: 'offer', offer: data });
    });

    window.onDBValue(window.dbRef(this.db, `${this.url}/answer`), (snapshot) => {
      const data = snapshot.val();
      if (data && this.onMessage) this.onMessage({ type: 'answer', answer: data });
    });

    // Listen for candidates
    window.onDBChildAdded(window.dbRef(this.db, `${this.url}/callerCandidates`), (snapshot) => {
      const data = snapshot.val();
      if (data && this.onMessage) this.onMessage({ type: 'candidate', role: 'caller', candidate: data });
    });

    window.onDBChildAdded(window.dbRef(this.db, `${this.url}/calleeCandidates`), (snapshot) => {
      const data = snapshot.val();
      if (data && this.onMessage) this.onMessage({ type: 'candidate', role: 'callee', candidate: data });
    });
  }

  async send(data) {
    if (data.type === 'offer') {
      await window.setDB(window.dbRef(this.db, `${this.url}/offer`), data.offer);
    } else if (data.type === 'answer') {
      await window.setDB(window.dbRef(this.db, `${this.url}/answer`), data.answer);
    } else if (data.type === 'candidate') {
      const role = data.role === 'caller' ? 'callerCandidates' : 'calleeCandidates';
      await window.pushDB(window.dbRef(this.db, `${this.url}/${role}`), data.candidate);
    } else if (data.type === 'leave') {
      await window.removeDB(this.roomRef);
    }
  }

  close() {
    if (this.roomRef) {
      window.removeDB(this.roomRef);
    }
  }
}

window.WebSocketSignaling = WebSocketSignaling;
window.FirebaseSignaling = FirebaseSignaling;
