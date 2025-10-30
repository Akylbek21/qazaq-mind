FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm i --no-audit --no-fund; \
    fi

COPY . .

RUN rm -rf node_modules .vite dist

RUN node -e "try{require.resolve('react-router-dom')}catch(e){process.exit(1)}" \
  || npm i react-router-dom@^6 --save --no-audit --no-fund

RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm i --no-audit --no-fund; \
    fi

RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache curl && \
    rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD curl -fsS http://127.0.0.1/ || exit 1

CMD ["nginx","-g","daemon off;"]