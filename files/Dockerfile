FROM node:16-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn db:gen
RUN yarn build:files

FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 betty

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/set_admin.js ./set_admin.js
COPY --from=builder /app/files/build ./

USER betty

EXPOSE 3001


CMD ["node", "files/server.js"]
