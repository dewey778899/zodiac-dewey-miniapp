FROM node:20-alpine

LABEL maintainer="dewey"
LABEL description="Zodiac Dewey miniapp builder for WeChat and Douyin"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG MINIAPP_TARGET=weapp
ARG TARO_APP_API_BASE=https://zodiac.xiaodengge.top
ARG TARO_APP_WEB_SHARE_BASE=https://zodiac.xiaodengge.top

ENV TARO_APP_API_BASE=${TARO_APP_API_BASE}
ENV TARO_APP_WEB_SHARE_BASE=${TARO_APP_WEB_SHARE_BASE}

RUN if [ "$MINIAPP_TARGET" = "tt" ]; then npm run build:tt; else npm run build:weapp; fi

CMD ["sh", "-c", "echo Build complete. Dist output is under /app/dist"]
