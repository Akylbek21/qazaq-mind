FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm i --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache curl && \
    rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD curl -fsS http://127.0.0.1/ || exit 1

CMD ["nginx","-g","daemon off;"]