FROM node:20-slim 

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /repo
COPY . .

RUN pnpm install

RUN apt-get update || true && apt-get install -y --no-install-recommends gnupg ca-certificates

RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Build the backend
WORKDIR /repo/apps/back
RUN mkdir -p dist
RUN pnpm install
RUN bun build src/index.ts --target=bun --compile --outfile ./dist/app
RUN ls -l dist

WORKDIR /repo/apps/front
RUN pnpm install
RUN pnpm run build


