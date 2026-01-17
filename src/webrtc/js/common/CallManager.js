/**
 * CallManager handles WebRTC PeerConnection and MediaStream logic.
 */
class CallManager {
  constructor(config, onStateChange, onIceCandidate) {
    this.config = config;
    this.onStateChange = onStateChange;
    this.onIceCandidate = onIceCandidate;
    
    this.pc = null;
    this.localStream = null;
    this.remoteStream = new MediaStream();
    this._state = CALL_STATUS.WAITING.id;
  }

  get state() {
    return this._state;
  }

  set state(val) {
    this._state = val;
    if (this.onStateChange) this.onStateChange(val);
  }

  /**
   * 미디어 장치 권한 체크 및 스트림 획득
   */
  async getMediaStream(localVideoElement) {
    if (this.localStream) return this.localStream;

    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true
    });
    this.localStream = stream;

    if (localVideoElement) {
      // 로컬 화면용으로 비디오 트랙만 따로 뽑은 새로운 스트림 적용 (현상 방지)
      const videoOnlyStream = new MediaStream(stream.getVideoTracks());
      localVideoElement.srcObject = videoOnlyStream;
    }
    return stream;
  }

  /**
   * PeerConnection 생성 및 설정
   */
  ensurePC(remoteVideoElement) {
    if (this.pc) return this.pc;
    
    this.pc = new RTCPeerConnection(this.config.iceServers);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => this.pc.addTrack(track, this.localStream));
    }

    if (remoteVideoElement) {
      remoteVideoElement.srcObject = this.remoteStream;
    }

    this.pc.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (stream) {
        stream.getTracks().forEach((t) => this.remoteStream.addTrack(t));
      } else {
        this.remoteStream.addTrack(event.track);
      }

      event.track.onmute = () => {
        console.warn("Remote track muted");
        this.state = CALL_STATUS.DISCONNECTED.id;
      };

      event.track.onended = () => {
        console.log('Remote track ended');
        this.state = CALL_STATUS.DISCONNECTED.id;
      };
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    this.pc.oniceconnectionstatechange = () => {
      console.log('ICE state:', this.pc.iceConnectionState);
      switch (this.pc.iceConnectionState) {
        case 'checking':
          this.state = CALL_STATUS.CONNECTING.id;
          break;
        case 'connected':
        case 'completed':
          this.state = CALL_STATUS.CONNECTED.id;
          break;
        case 'failed':
          this.state = CALL_STATUS.ERROR.id;
          break;
        case 'disconnected':
        case 'closed':
          this.closePC();
          this.state = CALL_STATUS.DISCONNECTED.id;
          break;
      }
    };

    return this.pc;
  }

  async createOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(offer) {
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(answer) {
    if (!this.pc.remoteDescription) {
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async addIceCandidate(candidate) {
    if (this.pc) {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  closePC() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }

  stopMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}

window.CallManager = CallManager;
