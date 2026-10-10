FROM node:26.11-alpine AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# O Node 25+ não traz mais o corepack, que instala o Yarn 4 do packageManager.
RUN npm install -g corepack@0.36.0 && corepack enable

# Dependências completas: usadas no build e nas migrations.
FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml prisma.config.ts ./
COPY prisma ./prisma
# O prisma generate do postinstall não conecta no banco, mas o prisma.config.ts exige a variável.
RUN DATABASE_URL=postgresql://build@localhost/build yarn install --immutable

FROM deps AS build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN yarn build

# Roda "prisma migrate deploy". Só instala o CLI do Prisma e o dotenv (usado
# pelo prisma.config.ts), nas versões do package.json.
FROM node:26.11-alpine AS migrate
WORKDIR /app
COPY package.json /tmp/package.json
RUN version() { node -p "require('/tmp/package.json').devDependencies['$1']"; } \
    && npm install --no-save --no-package-lock --no-fund --no-audit \
        "prisma@$(version prisma)" "dotenv@$(version dotenv)" \
    && npm cache clean --force \
    && rm -rf /root/.cache
COPY prisma.config.ts ./
COPY prisma ./prisma
CMD ["node_modules/.bin/prisma", "migrate", "deploy"]

# Só dependências de produção. O postinstall (prisma generate) sai porque o
# client já foi compilado para dist/ e o CLI não está nesta instalação.
FROM base AS prod-deps
COPY package.json yarn.lock .yarnrc.yml ./
RUN npm pkg delete scripts.postinstall \
    && yarn workspaces focus --production \
    && yarn cache clean --all

FROM node:26.11-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 3333
CMD ["node", "dist/main.js"]
