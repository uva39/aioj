FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000

# 개발 서버 기본 커맨드 (docker-compose에서 override)
CMD ["npm", "run", "dev"]
