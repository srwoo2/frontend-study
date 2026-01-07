[![Node.js CI](https://github.com/selim0915/frontend-study/actions/workflows/merge.yml/badge.svg?event=push)](https://github.com/selim0915/frontend-study/actions/workflows/merge.yml)

## 초기 설정
### 공통
1. Node.js 환경 구성
```
$ npm install -g nvm
$ nvm install 20.10.0
$ nvm use 20.10.0
```
2. 개발용 인증서 생성
```
$ mkdir cert
# openssl.cnf 파일 생성
$ openssl req -nodes -new -x509 -keyout cert/key.pem -out cert/cert.pem -days 365 -config cert/openssl.cnf
```

### Project 개발/운영 모드 실행

- 프론트 서버와 시그널링를 같이 실행
```
$ npm run prod:webrtc
# https://192.168.123.118:3000/
```