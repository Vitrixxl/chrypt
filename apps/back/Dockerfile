FROM node:20-slim

# Installer PNPM et activer corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Installation de Bun
RUN apt-get update && apt-get install -y curl gnupg ca-certificates unzip \
    && curl -fsSL https://bun.sh/install | bash \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.bun/bin:$PATH"

# Définir le répertoire de travail
WORKDIR /repo

# Copier tous les fichiers du monorepo (les fichiers nécessaires pour le backend)
COPY . .

# Installer les dépendances globales (root)
RUN pnpm install

# Installation des dépendances spécifiques au backend
WORKDIR /repo/apps/back
RUN pnpm install

# Générer et migrer la base de données
# RUN pnpm db:generate && pnpm db:migrate

# Builder le backend avec Bun
RUN bun build src/index.ts --target=bun --compile --outfile ./dist/app

# Commande pour démarrer l'application backend
CMD ["node", "./dist/app"]

