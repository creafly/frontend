FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_API_URL=https://api.creafly.localhost/agent
ARG NEXT_PUBLIC_IDENTITY_URL=https://api.creafly.localhost/identity
ARG NEXT_PUBLIC_NOTIFICATIONS_URL=https://api.creafly.localhost/notifications
ARG NEXT_PUBLIC_SUBSCRIPTIONS_URL=https://api.creafly.localhost/subscriptions
ARG NEXT_PUBLIC_STORAGE_URL=https://api.creafly.localhost/storage
ARG NEXT_PUBLIC_BRANDING_URL=https://api.creafly.localhost/branding
ARG NEXT_PUBLIC_SUPPORT_API_URL=https://api.creafly.localhost/support
ARG NEXT_PUBLIC_NOTIFICATIONS_WS_URL=wss://api.creafly.localhost/notifications

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_IDENTITY_URL=$NEXT_PUBLIC_IDENTITY_URL
ENV NEXT_PUBLIC_NOTIFICATIONS_URL=$NEXT_PUBLIC_NOTIFICATIONS_URL
ENV NEXT_PUBLIC_SUBSCRIPTIONS_URL=$NEXT_PUBLIC_SUBSCRIPTIONS_URL
ENV NEXT_PUBLIC_STORAGE_URL=$NEXT_PUBLIC_STORAGE_URL
ENV NEXT_PUBLIC_BRANDING_URL=$NEXT_PUBLIC_BRANDING_URL
ENV NEXT_PUBLIC_SUPPORT_API_URL=$NEXT_PUBLIC_SUPPORT_API_URL
ENV NEXT_PUBLIC_NOTIFICATIONS_WS_URL=$NEXT_PUBLIC_NOTIFICATIONS_WS_URL

RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
