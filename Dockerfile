# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.14.0
ARG PNPM_VERSION=10.32.1

FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
# --mount を削除しました
RUN npm install -g pnpm@${PNPM_VERSION}

FROM base AS build

# アプリケーションの構成に合わせてパスを調整
COPY ./application/package.json ./application/pnpm-lock.yaml ./application/pnpm-workspace.yaml ./
# ワークスペース配下の package.json もコピー
COPY ./application/client/package.json ./client/package.json
COPY ./application/server/package.json ./server/package.json

# --mount を削除し、通常のインストールに変更
RUN pnpm install --frozen-lockfile

COPY ./application .

RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# --mount を削除
RUN CI=true pnpm install --frozen-lockfile --prod --filter @web-speed-hackathon-2026/server

FROM base

COPY --from=build /app /app

EXPOSE 8080
CMD [ "pnpm", "start" ]
