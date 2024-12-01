# Node.js 이미지 설정
FROM node:22.9.0

# 애플리케이션 디렉토리 생성
RUN mkdir -p /app
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json /app/
RUN npm install

# 애플리케이션 코드 복사
COPY . /app/

# 환경 변수 설정
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

ARG PORT=3000
ENV PORT=$PORT

# TypeScript 컴파일
RUN npm run build

# 컨테이너 실행 시 빌드된 파일 실행
CMD ["node", "dist/main"]
