FROM node:22.9.0
RUN mkdir -p /app
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . /app/

# 환경변수 설정 (기본값 설정 가능)
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# 내부 포트를 동적으로 설정
ARG PORT=3000
ENV PORT=$PORT

CMD ["npm", "run", "start:dev"]