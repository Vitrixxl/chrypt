FROM node:20-slim 

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /repo
COPY ../../ .

RUN pnpm install

WORKDIR /repo/apps/front
RUN pnpm install
RUN pnpm run build



